import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { redirect } from 'next/navigation';
import { Container, Flex, Loader, Skeleton, Text, Title } from '@mantine/core';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { SelectOrg } from '@/components/SelectOrg';
import { getUser } from '@/data/getUser';
import { getOrgs } from '@/data/getOrgs';
import { AuthenticationLink } from '@/components/AuthenticationLink';
import { decrypt, encrypt } from '@/functions/crypt';
import { MatrixWrapper } from '@/components/MatrixWrapper';
import { UserAndOrg } from '@/components/UserAndOrg';

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

  const token = etoken && iv ? decrypt(etoken, iv) : undefined;

  const octokit = token
    ? new Octokit({
        auth: `token ${token}`,
      })
    : undefined;

  return (
    <>
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

        {octokit && (
          <Suspense
            fallback={
              <Flex justify="center">
                <Loader />
              </Flex>
            }
          >
            <UserAndOrg octokit={octokit} org={org} code={code} token={token} />
          </Suspense>
        )}
      </Container>

      <Container fluid my={40}>
        {octokit && (
          <Suspense
            fallback={
              <>
                <Skeleton height={20} radius="xl" />
                <Skeleton height={20} mt={10} radius="xl" />
                <Skeleton height={20} mt={10} radius="xl" />
                <Skeleton height={20} mt={10} radius="xl" />
                <Skeleton height={20} mt={10} radius="xl" />
                <Skeleton height={20} mt={10} radius="xl" />
              </>
            }
          >
            <MatrixWrapper octokit={octokit} org={org} />
          </Suspense>
        )}
      </Container>
    </>
  );
}
