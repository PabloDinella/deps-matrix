import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { redirect } from 'next/navigation';
import { Matrix } from '@/components/Matrix';
import { SelectOrg } from '@/components/SelectOrg';

const appAuth = createAppAuth({
  appId: JSON.parse(process.env.APP_ID || ''),
  privateKey: process.env.PRIVATE_KEY || '',
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

const filterNonNull = <T,>(item: T): item is NonNullable<T> => item !== null;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { code: string; token: string; org: string };
}) {
  const { code, token, org } = searchParams;

  if (!token && code) {
    const authentication = (await appAuth({
      type: 'oauth-user',
      code: searchParams.code,
    })) as { token: string };

    return redirect(`/?token=${authentication.token}`);
  }

  if (!token && !code) {
    return (
      <p>
        <a href="https://github.com/apps/deps-matrix/installations/new">Install deps-matrix</a> in
        an organization or{' '}
        <a
          href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}`}
        >
          just authenticate
        </a>{' '}
        if you already installed
      </p>
    );
  }

  const octokit = new Octokit({
    auth: `token ${token}`,
  });

  const user = await octokit.rest.users.getAuthenticated();

  const userInfo = <p>Logged in as {user.data.login}</p>;

  const orgsResponse = await octokit.request('GET /user/memberships/orgs', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!org) {
    return (
      <>
        {userInfo}

        <a href="https://github.com/apps/deps-matrix/installations/new">
          Add or remove GitHub Organizations
        </a>

        <p>
          <SelectOrg orgs={orgsResponse.data} />
        </p>
      </>
    );
  }

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

  return (
    <>
      {userInfo}

      <p>
        <a href="https://github.com/apps/deps-matrix/installations/new">
          Add or remove GitHub Organizations
        </a>
      </p>

      <p>
        <SelectOrg orgs={orgsResponse.data} selected={org} />
      </p>

      <Matrix reposAndPackageJsons={reposAndPackageJsons} />
    </>
  );
}
