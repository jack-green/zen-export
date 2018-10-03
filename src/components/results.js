/* global moment */
import React from 'react';

import { getCSV } from '../brain';

export default class Results extends React.Component {
    renderCategory(category) {
        return (
            <div className="category" key={`cat-${category.name}`}>
                <h2>{category.name}</h2>
                <table className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>Skill</th>
                            <th>Last Result</th>
                            <th>PR Result</th>
                            <th>Last Attempt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {category.skills.map((skill) => (
                            <tr key={skill.skillId}>
                                <td>{skill.skillname}</td>
                                <td>{skill.lastResultText}</td>
                                <td>{skill.prResultText}</td>
                                <td>{moment().subtract(skill.dayssince, 'days').format('DD/MM/YYYY')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    back = (e) => {
        const { onBack } = this.props;
        e.preventDefault();
        onBack();
    }

    download = (e) => {
        e.preventDefault();
        const csv = getCSV();
        const downloadLink = document.createElement("a");
        const blob = new Blob(["\ufeff", csv]);
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "zen-export.csv";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

    }

    render() {
        const { results } = this.props;
        return (
            <div className="results">
                <div className="my-4 d-flex justify-content-between">
                    <a href="/" onClick={this.back} class="btn btn-secondary">Back</a>
                    <a href="/" onClick={this.download} class="btn btn-primary">Download Spreadsheet</a>
                </div>
                {results.map(category => this.renderCategory(category))}
            </div>
        )
    }
}