import React from 'react';

const Status = ({ status, error, progress }) => (
    <div className="row">
        <div className="col-lg-8 offset-lg-2">
            {error ? (
                <div className="alert alert-danger text-center">{error}</div>
            ) : (
                <div className="alert alert-info text-center">
                    <p>{status}</p>
                    <div className="progress">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

export default Status;