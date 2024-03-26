import { Text } from '@mantine/core';
import { Octokit } from 'octokit';
import { getOrgs } from '@/data/getOrgs';
import { getUser } from '@/data/getUser';
import { AuthenticationLink } from './AuthenticationLink';
import { SelectOrg } from './SelectOrg';

export async function UserAndOrg({
  octokit,
  token,
  code,
  org,
}: {
  octokit?: Octokit;
  token?: string;
  code?: string;
  org: string;
}) {
  const userData = await getUser(octokit);

  const orgs = await getOrgs(octokit);

  const needsAuth = !token && !code;

  const authenticated = !needsAuth && userData;

  return (
    <>
      {needsAuth && (
        <Text mb={15}>
          <a href="https://github.com/apps/deps-matrix/installations/new">Install deps-matrix</a> in
          an organization or <AuthenticationLink>just authenticate</AuthenticationLink> if you
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
            <SelectOrg orgs={orgs?.data} selected={org} /> authenticated as {userData?.data.login} (
            <a href="/">clear token</a>)
          </Text>
        </>
      )}

      {authenticated && org && (
        <>
          <Text mb={5} fs="italic">
            <Text span fw={799}>
              Tips:
            </Text>{' '}
            Click on any column to sort; Only showing dependencies present in more than one repo;
            Not showing devDependencies;
          </Text>

          <Text mb={15} fs="italic">
            <Text span fw={799}>
              Watch out:
            </Text>{' '}
            If you don&apos;t want to leak the dependencies versions, avoid sharing this URL.
          </Text>
        </>
      )}
    </>
  );
}
