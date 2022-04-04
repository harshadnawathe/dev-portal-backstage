/* eslint-disable */
import React from 'react';
import {Table, TableColumn} from '@backstage/core-components';
import {configApiRef, useApi} from "@backstage/core-plugin-api";
import {jacocoReportsApiRef} from "../../api";
import {useEntity} from "@backstage/plugin-catalog-react";
import {readGitHubIntegrationConfigs} from "@backstage/integration";
import {getProjectNameFromEntity} from "../getProjectNameFromEntity";
import {useAsync} from "react-use";
import {Button} from "@material-ui/core";

const columns: TableColumn[] = [
    {title: 'Artifact Id', field: 'artifactId'},
    {title: 'Created At', field: 'createdAt'},
    {title: 'View Details', field: 'downloadLink'},
];

export const DenseTable = () => {
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
        const artifact = repo && owner
            ? await api.downloadArtifact({
                hostname,
                owner,
                repo,
                artifact_id: artifactId,
                archive_format: "zip"
            })
            : Promise.reject(new Error('No repo/owner provided'));
        return artifact
    }

    async function onViewArtifact(artifact: any) {
        console.log("artifact id is", artifact.id, repo, owner)
        const downloadedArtifact = await downloadArtifact(artifact.id)
        await api.getArtifactDetails({url: downloadedArtifact.url})

        debugger;
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

    return (
        <Table
            title="Example User List (fetching data from randomuser.me)"
            options={{search: false, paging: false}}
            columns={columns}
            data={data}
        />
    );
};

export const ExampleFetchComponent = () => {
    return <DenseTable/>;
};
