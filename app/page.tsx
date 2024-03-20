import { App } from 'octokit';
import { Welcome } from '../components/Welcome/Welcome';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Matrix } from '@/components/Matrix';

const ORG_NAME = process.env.ORG_NAME || '';

const app = new App({
  appId: JSON.parse(process.env.APP_ID || ''),
  privateKey: process.env.PRIVATE_KEY || '',
});

const filterNonNull = <T,>(item: T): item is NonNullable<T> => item !== null;

export default async function HomePage() {
  const octokit = await app.getInstallationOctokit(Number(process.env.INSTALLATION));

  // const response = await octokit.graphql(
  //   `
  //   {
  //     organization(login: process.env.ORG_NAME) {
  //       repositories(first: 100, visibility: "PRIVATE") {
  //         nodes {
  //           name
  //         }
  //         totalCount
  //       }
  //     }
  //   }
  // `
  //   {
  //     headers: {
  //       authorization: `token secret123`,
  //     },
  //   }
  // );

  const response = await octokit.rest.repos.listForOrg({
    type: 'all',
    org: ORG_NAME,
    per_page: 100,
    page: 1,
  });

  octokit.rest.repos.getContent();

  const repos = response.data;

  const reposAndPackageJsons = (
    await Promise.all(
      repos.map(async (repo) => {
        try {
          const content = await octokit.rest.repos.getContent({
            owner: ORG_NAME,
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
          // console.log(error);

          return null;
        }
      })
    )
  ).filter(filterNonNull);

  // console.log(repos);

  console.log(reposAndPackageJsons);

  return (
    <>
      <Welcome />

      {repos.length}

      {/* {repos.map((repo) => (
        <p>{repo.name}</p>
      ))} */}

      {/* <pre>{JSON.stringify(response, null, 2)}</pre> */}

      {/* <pre>
        {JSON.stringify(
          reposAndPackageJsons.map((pkg) => pkg.dependencies),
          null,
          2
        )}
      </pre> */}

      <Matrix reposAndPackageJsons={reposAndPackageJsons} />

      <ColorSchemeToggle />
    </>
  );
}
