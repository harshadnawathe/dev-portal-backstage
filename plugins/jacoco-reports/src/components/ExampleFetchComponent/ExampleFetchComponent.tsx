/* eslint-disable */
import React, {useState} from 'react';
import {Table, TableColumn} from '@backstage/core-components';
import {configApiRef, useApi} from "@backstage/core-plugin-api";
import {jacocoReportsApiRef} from "../../api";
import {useEntity} from "@backstage/plugin-catalog-react";
import {readGitHubIntegrationConfigs} from "@backstage/integration";
import {getProjectNameFromEntity} from "../getProjectNameFromEntity";
import {useAsync} from "react-use";
import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";

const testReportColumn: TableColumn[] = [
    {title: 'GROUP', field: 'GROUP'},
    {title: 'PACKAGE', field: 'PACKAGE'},
    {title: 'CLASS', field: 'CLASS'},
    {title: 'INSTRUCTION_MISSED', field: 'INSTRUCTION_MISSED'},
    {title: "INSTRUCTION_COVERED", field: "INSTRUCTION_COVERED"},
    {title: "BRANCH_MISSED", field: "BRANCH_MISSED"},
    {title: "BRANCH_COVERED", field: "BRANCH_COVERED"},
    {title: "LINE_MISSED", field: "LINE_MISSED"},
    {title: "LINE_COVERED", field: "LINE_COVERED"},
    {title: "COMPLEXITY_MISSED", field: "COMPLEXITY_MISSED"},
    {title: "COMPLEXITY_COVERED", field: "COMPLEXITY_COVERED"},
    {title: "METHOD_MISSED", field: "METHOD_MISSED"},
    {title: "METHOD_COVERED", field: "METHOD_COVERED"},
];

const columns: TableColumn[] = [
    {title: 'Artifact Id', field: 'artifactId'},
    {title: 'Created At', field: 'createdAt'},
    {title: 'View Details', field: 'downloadLink'},
];

export const JacocoTestArtifacts = () => {
    const [openDialogue, setOpen] = useState(false);
    const [testReport, setTestReport] = useState([]);
    const [showLoader, setShowLoader] = useState(false);

    const config = useApi(configApiRef);
    const api = useApi(jacocoReportsApiRef);
    const {entity} = useEntity();
    const hostname = readGitHubIntegrationConfigs(
        config.getOptionalConfigArray('integrations.github') ?? [],
    )[0].host;
    const projectName = getProjectNameFromEntity(entity);
    const [owner, repo] = (projectName && projectName.split('/')) || [];

    function fetchJacocoReports() {
        return useAsync(async () => {
            return repo && owner
                ? api.getJacocoReportList({
                    hostname,
                    owner,
                    repo,
                })
                : Promise.reject(new Error('No repo/owner provided'));
        }, [repo, owner])
    }

    async function downloadArtifact(artifactId: number) {
        return repo && owner
            ? await api.downloadArtifact({
                hostname,
                owner,
                repo,
                artifact_id: artifactId,
                archive_format: "zip"
            })
            : Promise.reject(new Error('No repo/owner provided'))
    }

    async function onViewArtifact(artifact: any) {
        setShowLoader(true);
        const downloadedArtifact = await downloadArtifact(artifact.id)
        const testReport = await api.getArtifactDetails({url: downloadedArtifact.url})
        setOpen(true)
        setTestReport(testReport)
        setShowLoader(false);
    }

    const artifacts = fetchJacocoReports();

    // @ts-ignore
    const data = !artifacts.loading ? artifacts.value.data.artifacts.map(artifact => {
        return {
            artifactId: artifact.id,
            createdAt: artifact.created_at,
            downloadLink: <Button onClick={() => onViewArtifact(artifact)}>View Artifact</Button>
        };
    }) : [];

    const closeDialog = () => {
        setOpen(false)
    }

    function renderCSVReportContent() {
        return (
            <Table
                title="Test Report Details"
                options={{search: false, paging: false}}
                columns={testReportColumn}
                data={testReport}
            />
        )
    }

    function renderCsvReport() {
        return (
            <Dialog
                open={openDialogue}
                onClose={closeDialog}
                aria-labelledby="dialog-title"
                aria-describedby="dialog-description" fullWidth
                maxWidth="lg">
                <DialogTitle id="dialog-title">Test Report</DialogTitle>
                <DialogContent>
                    {(testReport.length === 0) ? <h1>No Report Present</h1> : renderCSVReportContent()}
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={closeDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>)
    }

    function circularIndeterminate() {
        return (
            <Box sx={{ display: 'flex' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <><Table
            title="Github Action Artifacts"
            options={{search: false, paging: false}}
            columns={columns}
            data={data}
        />
            {showLoader ? circularIndeterminate() : renderCsvReport()}
        </>
    );
};

export const ExampleFetchComponent = () => {
        return <JacocoTestArtifacts/>;
    }
;
