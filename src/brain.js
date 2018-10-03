/* global axios moment */

const loginUrl = 'https://memberappv220.zenplanner.com/auth/v1/login';
const profileUrl = 'https://memberappapiv220.zenplanner.com/elements/api-v2/profiles/current?_={timestamp}';
const resultsUrl = 'https://memberappapiv220.zenplanner.com/elements/api-v2/workouts/progressResults?personId={personId}&_={timestamp}';

const deets = {
    personId: null,
    orgId: null,
    token: null,
    refreshToken: null,
    categories: {},
    csv: null,
};

const CSVFields = [
    {
        id: 'skillname',
        title: 'Skill',
    },
    {
        id: 'categoryId',
        title: 'Category',
        value: (val) => getCategory(val),
    },
    {
        id: 'lastResultText',
        title: 'Last Result',
    },
    {
        id: 'lastresult',
        title: 'Last Result (raw)'
    },
    {
        id: 'prResultText',
        title: 'PR Result',
    },
    {
        id: 'prResult',
        title: 'PR Result (raw)',
    },
    {
        id: 'dayssince',
        title: 'Days since',
    },
    {
        id: 'dayssince',
        title: 'Date',
        value: (val) => {
            return moment().subtract(val, 'days').format('DD/MM/YYYY');
        }
    },
    {
        id: 'isBenchMark',
        title: 'Is Bench Mark?',
        value: val => val ? 'Yes' : 'No',
    },
    {
        id: 'measurementClass',
        title: 'Measurement Type',
    },
    {
        id: 'success',
        title: 'Success?',
        value: val => val ? 'Yes' : 'No',
    },
    {
        id: 'tries',
        title: 'Tries',
    },
];

function getHeaders() {
    return {
        headers: {
            Authorization: 'Bearer ' + deets.token,
            'X-Auth-Refresh': deets.refreshToken,
            'PartitionId': deets.orgId,
            'Content-Type': 'application/json',
            'Accept': 'application/json; charset=utf-8',
        },
    }
}

function tokenize(string, tokens) {
    Object.keys(tokens).forEach((token) => {
        string = string.replace(`{${token}}`, tokens[token]);
    });
    return string;
}

function getCacheBuster() {
    return new Date().getTime();
}

async function login(email, password) {
    return axios.post(loginUrl, {
        orgId: null,
        username: email,
        password: password,
        requiredRoles: ["PORTAL"]
    })
        .then((response) => {
            if (response.data.status === 'SUCCESS') {
                deets.token = response.data.token;
                deets.refreshToken = response.data.refreshToken;
                deets.orgId = response.data.organizationUsers[0].organization.id;
                return true;
            }

            let error = response.data.status;
            if (error === 'INVALID' || error === 'PASSWORD_INCORRECT') {
                error = 'Invalid email / password';
            }

            throw(new Error(error));
        })
        .catch((error) => {
            console.log('LOGIN ERROR', error);
            throw(error);
        });
}

async function fetchProfile() {
    return axios.get(tokenize(profileUrl, { timestamp: getCacheBuster() }), getHeaders())
        .then((response) => {
            deets.personId = response.data.payload.person.id;
            return true;
        })
        .catch((error) => {
            console.log('FETCH PROFILE ERROR', error);
            throw(error);
        });
}

async function fetchResults() {
    return axios.get(tokenize(resultsUrl, { personId: deets.personId, timestamp: getCacheBuster() }), getHeaders())
        .then((response) => {
            return response.data;
        })
        .catch(function (error) {
            console.log('FETCH RESULTS ERROR', error);
            throw(error);
        });
}

function cacheCategories(categories) {
    console.log('cacheCategories', deets);
    categories.forEach((category) => {
        deets.categories[category.id] = category.label;
    });
}

function getCategory(categoryId) {
    return deets.categories[categoryId];
}

/*
categoryId: "9833BEA1-4AB6-4842-A639-9D7375CD5B59"
dayssince: 654
isBenchMark: false
lastResultText: "78.00 reps"
lastresult: 78
measurementClass: "Repetition"
personId: "1BE173E4-E933-402F-A874-97B61DCC03A6"
prResult: 78
prResultText: "78.00 reps"
skillId: "CB76989A-F2C2-4C7F-AC18-0F46AA4C2B01"
skillname: "161217"
success: true
tries: 1
*/

function getCSVHeaders() {
    return CSVFields.map(field => field.title);
}

function getCSVRow(data) {
    return CSVFields.map(field => {
        const value = data[field.id];
        if(typeof field.value === 'function') {
            return field.value(value);
        }
        return value;
    });
}

async function parseResults(data) {
    const categories = {};

    cacheCategories(data.skillCategories);

    const csv = [];
    csv.push(getCSVHeaders());
    
    data.results.forEach((result) => {
        if (!result.lastresult) return; // nothing recorded
        csv.push(getCSVRow(result));

        var categoryName = getCategory(result.categoryId);
        if(typeof categories[categoryName] === 'undefined') {
          categories[categoryName] = [];
        }
        categories[categoryName].push(result);
    });

    deets.csv = csv;
    console.table(csv);

    // sort
    const categoryNames = Object.keys(categories);
    categoryNames.sort();

    const sortedCategories = [];
    categoryNames.forEach((category) => {
        const results = categories[category];
        results.sort((a, b) => {
            if (a.skillname === b.skillname) return 0;
            return a.skillname > b.skillname ? 1 : -1;
        });
        sortedCategories.push({
            name: category,
            skills: results
        });
    });

    return sortedCategories;
}

export async function getZenRecords(email, password, setStatus) {
    if(!email || !password) {
        throw new Error('Email & Password are required');
    }

    setStatus('Logging In', 25);

    try {
        await login(email, password)
    } catch (error) {
        throw(error);
    }

    setStatus('Fetching Profile', 50);

    try {
        await fetchProfile();
    } catch (error) {
        throw(error);
    }

    setStatus('Fetching Results', 75);

    let data = null;

    try {
        data = await fetchResults();
    } catch(error) {
        throw(error);
    }

    setStatus('Formatting Results', 100);

    try {
        data = await parseResults(data);
    } catch(error) {
        throw(error);
    }

    return data;
}

export function getCSV() {
    const lines = [];
    deets.csv.forEach((line) => {
        lines.push(line.join(','));
    });
    return lines.join('\n');
}