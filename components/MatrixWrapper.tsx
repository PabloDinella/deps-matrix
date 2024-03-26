import { Octokit } from 'octokit';
import { getReposAndPackageJsons } from '@/data/getReposAndPackageJsons';
import { Matrix } from './Matrix';

export async function MatrixWrapper({ octokit, org }: { octokit: Octokit; org: string }) {
  const reposAndPackageJsons = await getReposAndPackageJsons({ octokit, org });

  if (reposAndPackageJsons) {
    return <Matrix reposAndPackageJsons={reposAndPackageJsons} />;
  }

  return null;
}
