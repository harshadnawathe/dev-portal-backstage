import {readGitHubIntegrationConfigs} from '@backstage/integration';
import {JacocoReportsApi} from './JacocoReportsApi';
import {Octokit} from '@octokit/rest';
import {ConfigApi, DiscoveryApi, FetchApi, OAuthApi} from '@backstage/core-plugin-api';

export class JacocoReportsClient implements JacocoReportsApi {
    private readonly configApi: ConfigApi;
    private readonly githubAuthApi: OAuthApi;
    private readonly fetchApi: FetchApi;
    private readonly discoveryApi: DiscoveryApi;

    constructor(options: { configApi: ConfigApi; githubAuthApi: OAuthApi, fetchApi: FetchApi, discoveryApi: DiscoveryApi }) {
        this.configApi = options.configApi;
        this.githubAuthApi = options.githubAuthApi;
        this.fetchApi = options.fetchApi;
        this.discoveryApi = options.discoveryApi;
    }

    private async getOctokit(hostname?: string): Promise<Octokit> {
        // TODO: Get access token for the specified hostname
        const token = await this.githubAuthApi.getAccessToken(['repo']);
        const configs = readGitHubIntegrationConfigs(
            this.configApi.getOptionalConfigArray('integrations.github') ?? [],
        );
        const githubIntegrationConfig = configs.find(
            v => v.host === hostname ?? 'github.com',
        );
        const baseUrl = githubIntegrationConfig?.apiBaseUrl;
        return new Octokit({auth: token, baseUrl});
    }

    async getJacocoReportList({
                                  hostname,
                                  owner,
                                  repo
                              }: {
        hostname: string,
        owner: string,
        repo: string,
    }): Promise<any> {
        const octokit = await this.getOctokit(hostname);
        return octokit.actions.listArtifactsForRepo({
            owner,
            repo
        });
    }

    async getArtifactDetails({url,}: { url: string }): Promise<any> {
        const baseUrl = await this.discoveryApi.getBaseUrl('jacoco');
        const response =  await this.fetchApi.fetch(`${baseUrl}/report`, {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({url: url})
        })
        return await response.json();
    }

    async downloadArtifact({
                               hostname,
                               owner,
                               repo,
                               artifact_id,
                               archive_format
                           }: {
        hostname: string,
        owner: string,
        repo: string,
        artifact_id: number,
        archive_format: string
    }): Promise<any> {
        const octokit = await this.getOctokit(hostname);
        return octokit.actions.downloadArtifact({
            owner,
            repo,
            artifact_id,
            archive_format
        });
    }

}
