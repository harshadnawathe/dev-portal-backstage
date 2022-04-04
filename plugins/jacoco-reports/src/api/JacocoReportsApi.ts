import {RestEndpointMethodTypes} from '@octokit/rest';
import {createApiRef} from '@backstage/core-plugin-api';

export const jacocoReportsApiRef = createApiRef<JacocoReportsApi>({
    id: 'plugin.jacoco-report.service',
});

export type JacocoReportsApi = {
    getJacocoReportList: ({
                              hostname,
                              owner,
                              repo
                          }: {
        hostname: string;
        owner: string;
        repo: string;
    }) => Promise<RestEndpointMethodTypes["actions"]["listArtifactsForRepo"]["response"]>;

    downloadArtifact: ({
                           hostname,
                           owner,
                           repo,
                           artifact_id,
                           archive_format
                       }: {
        hostname: string;
        owner: string;
        repo: string;
        artifact_id: number,
        archive_format: string
    }) => Promise<RestEndpointMethodTypes["actions"]["downloadArtifact"]["response"]>;

    getArtifactDetails: ({
                             url
                         }: { url: string }) => Promise<any>
};
