import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { redirect } from 'next/navigation';
import { Box, Container, Flex, Text, Title, getSpacing } from '@mantine/core';
import dynamic from 'next/dynamic';
import { Matrix } from '@/components/Matrix';
import { SelectOrg } from '@/components/SelectOrg';
import { getUser } from '@/data/getUser';
import { getOrgs } from '@/data/getOrgs';
import { getReposAndPackageJsons } from '@/data/getReposAndPackageJsons';
import { AuthenticationLink } from '@/components/AuthenticationLink';
import { CookieComponent } from '@/components/CookieComponent';
import { decrypt, encrypt } from '@/functions/crypt';

const GithubStar = dynamic(() => import('@/components/GithubStar'), { ssr: false });

const appAuth = createAppAuth({
  appId: JSON.parse(process.env.APP_ID || ''),
  privateKey: process.env.PRIVATE_KEY || '',
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

type PageQueryString = { code: string; etoken: string; org: string; iv: string };

export default async function HomePage({ searchParams }: { searchParams: PageQueryString }) {
  const { code, etoken, org, iv } = searchParams;

  if ((!etoken || !iv) && code) {
    const authentication = (await appAuth({
      type: 'oauth-user',
      code: searchParams.code,
    })) as { token: string };

    const encrypted = encrypt(authentication.token);

    const queryString = new URLSearchParams({
      etoken: encrypted.ciphertext,
      iv: encrypted.iv,
    } satisfies Partial<PageQueryString>);

    return redirect(`/?${queryString.toString()}`);
  }

  const token = etoken && iv ? decrypt(etoken, iv) : null;

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
      <CookieComponent />

      <Container>
        <Flex my={15} justify="flex-end">
          <Text ta="right" mt={3} mr={10}>
            Made by{' '}
            <a href="https://github.com/pablodinella" target="_blank" rel="noreferrer noopener">
              PabloDinella
            </a>{' '}
            (
            <a
              href="https://github.com/pablodinella/deps-matrix"
              target="_blank"
              rel="noreferrer noopener"
            >
              source
            </a>
            )
          </Text>

          <GithubStar />
        </Flex>

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
      </Container>

      <Container fluid my={40}>
        {reposAndPackageJsons ? <Matrix reposAndPackageJsons={reposAndPackageJsons} /> : null}
      </Container>
    </>
  );
}
