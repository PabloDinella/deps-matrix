import { Octokit } from 'octokit';

export async function getOrgs(octokit?: Octokit) {
  if (!octokit) {
    return null;
  }

  try {
    return await octokit.request('GET /user/memberships/orgs', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  } catch (error) {
    console.error("couldn't get orgs");
    console.error(error);

    return null;
  }
}
