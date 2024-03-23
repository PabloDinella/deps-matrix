import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { redirect } from 'next/navigation';
import { Matrix } from '@/components/Matrix';
import { SelectOrg } from '@/components/SelectOrg';
import { getUser } from '@/data/getUser';
import { getOrgs } from '@/data/getOrgs';
import { getReposAndPackageJsons } from '@/data/getReposAndPackageJsons';
import { AuthenticationLink } from '@/components/AuthenticationLink';
import { Container, Text, Title } from '@mantine/core';

const appAuth = createAppAuth({
  appId: JSON.parse(process.env.APP_ID || ''),
  privateKey: process.env.PRIVATE_KEY || '',
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

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

  const octokit = token
    ? new Octokit({
        auth: `token ${token}`,
      })
    : undefined;

  const userData = await getUser(octokit);

  const orgs = await getOrgs(octokit);

  const reposAndPackageJsons = await getReposAndPackageJsons({ octokit, org });

  const needsAuth = !token && !code;

  const authenticated = !needsAuth && userData;

  return (
    <>
      <Container>
        <Text my={15} ta="right">
          Made by{' '}
          <a href="https://github.com/pablodinella" target="_blank" rel="noreferrer noopener">
            PabloDinella
          </a>
        </Text>

        <Title mb={15}>deps-matrix</Title>

        <Text mb={15}>
          Analyze the versions of dependencies across all repositories in your GitHub organization
        </Text>

        {needsAuth && (
          <Text mb={15}>
            <a href="https://github.com/apps/deps-matrix/installations/new">Install deps-matrix</a>{' '}
            in an organization or <AuthenticationLink>just authenticate</AuthenticationLink> if you
            already installed
          </Text>
        )}

        {token && !userData && (
          <Text mb={15}>
            Token invalid or expired, try to{' '}
            <AuthenticationLink>authenticate again</AuthenticationLink>
          </Text>
        )}

        {authenticated && (
          <>
            <Text mb={15}>
              <a href="https://github.com/apps/deps-matrix/installations/new">
                Add or remove GitHub Organizations
              </a>
            </Text>

            <Text mb={15}>
              <SelectOrg orgs={orgs?.data} selected={org} /> authenticated as {userData?.data.login}{' '}
              (<a href="/">clear token</a>)
            </Text>

            <Text mb={15} fs="italic">
              <Text span fw={799}>
                Tips:
              </Text>{' '}
              Click on any column to sort; Only showing dependencies present in more than one repo;
              Not showing devDependencies;
            </Text>
          </>
        )}
      </Container>

      <Container fluid my={40}>
        {reposAndPackageJsons ? <Matrix reposAndPackageJsons={reposAndPackageJsons} /> : null}
      </Container>
    </>
  );
}
