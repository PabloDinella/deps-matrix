'use client';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import semverCompare from 'semver-compare';
import { rem } from '@mantine/core';

export function Matrix({
  reposAndPackageJsons,
}: {
  reposAndPackageJsons: {
    repo: { id: number; name: string };
    packageJson: { dependencies: Record<string, string> };
  }[];
}) {
  const rowData: Record<string, string>[] = reposAndPackageJsons.map((item) => ({
    repoName: item.repo.name,
    ...item.packageJson.dependencies,
  }));

  const depsList = reposAndPackageJsons.reduce<any[]>(
    (final, item) => [...final, ...Object.keys(item.packageJson.dependencies || [])],
    []
  );

  const occurrencies = depsList.reduce((final, depName) => {
    if (depName in final) {
      return final;
    }

    const quantity = depsList.filter((item) => item === depName).length;

    if (quantity > 1) {
      return { ...final, [depName]: quantity };
    }

    return final;
  }, {});

  const sortedOccurrencies = Object.keys(occurrencies).sort(
    (depName1, depName2) => occurrencies[depName2] - occurrencies[depName1]
  );

  const columnDefs = sortedOccurrencies.map((item) => ({
    field: item,
    width: 150,
    headerTooltip: item,
    comparator: (valueA: string, valueB: string) =>
      semverCompare(
        valueA?.replaceAll(/[^(\d|.)]/g, '') || '',
        valueB?.replaceAll(/[^(\d|.)]/g, '') || ''
      ),
  }));

  return (
    <div
      className="ag-theme-quartz" // applying the grid theme
      style={{ height: `calc(100vh - ${rem(40 * 2)})` }}
    >
      <AgGridReact
        sortingOrder={['desc']}
        rowData={rowData}
        columnDefs={[
          { field: 'repoName', pinned: 'left' },
          { ...columnDefs[0], sort: 'desc' },
          ...columnDefs.slice(1),
        ]}
      />
    </div>
  );
}
