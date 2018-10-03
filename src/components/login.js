import React from 'react';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
        };
    }

    onSubmit = (e) => {
        const { onLogin } = this.props;
        const { email, password } = this.state;
        e.preventDefault();
        onLogin(email, password);
    }

    render() {
        const { loading } = this.props;
        const { email, password } = this.state;

        return (
            <div className="card">
                <div className="card-header">
                    Zen Planner Login
                </div>
                <div className="card-body">
                    <form method="post" onSubmit={this.onSubmit}>
                        <div className="alert alert-danger" style={{ display: 'none' }}></div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                className="form-control"
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => this.setState({ email: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                className="form-control"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => this.setState({ password: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        {loading ? (
                            <button className="btn btn-primary btn-block" disabled>Fetching...</button>
                        ) : (
                            <button type="submit" className="btn btn-primary btn-block">Fetch My Results</button>
                        )}
                    </form>
                </div>
            </div>
        );
    }
}