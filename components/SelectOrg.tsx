'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCreateQueryString } from '../hooks/useCreateQueryString';

export function SelectOrg({
  orgs,
  selected,
}: {
  orgs?: { organization: { login: string } }[];
  selected?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCreateQueryString(searchParams);

  return (
    <select
      onChange={(event) => {
        router.push(`${pathname}?${createQueryString('org', event.target.value)}`);
      }}
      value={selected}
    >
      <option value="">Select one organization</option>
      {orgs?.map((org) => (
        <option key={org.organization.login} value={org.organization.login}>
          {org.organization.login}
        </option>
      ))}
    </select>
  );
}
