import { Octokit } from 'octokit';

export async function getUser(octokit?: Octokit) {
  if (!octokit) {
    return null;
  }

  try {
    return await octokit.rest.users.getAuthenticated();
  } catch (error) {
    console.error("couldn't get user");
    console.error(error);

    return null;
  }
}
