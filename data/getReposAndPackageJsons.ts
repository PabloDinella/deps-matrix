import { Octokit } from 'octokit';

const filterNonNull = <T>(item: T): item is NonNullable<T> => item !== null;

export async function getReposAndPackageJsons({
  octokit,
  org,
}: {
  octokit?: Octokit;
  org: string;
}) {
  if (!octokit || !org) {
    return null;
  }

  try {
    const response = await octokit.rest.repos.listForOrg({
      type: 'all',
      org,
      per_page: 100,
      page: 1,
    });

    const repos = response.data;

    const reposAndPackageJsons = (
      await Promise.all(
        repos.map(async (repo) => {
          try {
            const content = await octokit.rest.repos.getContent({
              owner: org,
              repo: repo.name,
              path: 'package.json',
              headers: {
                Accept: 'application/vnd.github.v3.raw',
              },
            });

            return {
              repo,
              packageJson: JSON.parse(String(content.data)),
            };
          } catch (error) {
            console.log("Couldn't get content for", repo.name, repo.owner.name);

            return null;
          }
        })
      )
    ).filter(filterNonNull);

    return reposAndPackageJsons;
  } catch (error) {
    console.error("couldn't get repos and packagejsons");
    console.error(error);

    return null;
  }
}
