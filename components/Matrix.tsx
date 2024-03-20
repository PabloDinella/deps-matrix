'use client';

import { Table } from '@mantine/core';

import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the grid
import { useState } from 'react';
import semverCompare from 'semver-compare';

export function Matrix({
  reposAndPackageJsons,
}: {
  reposAndPackageJsons: {
    repo: { id: number; name: string };
    packageJson: { dependencies: Record<string, string> };
  }[];
}) {
  console.log(reposAndPackageJsons);

  // const rows = reposAndPackageJsons.map((item) => (
  //   <Table.Tr key={item?.repo.id}>
  //     <Table.Td>{item?.repo.name}</Table.Td>
  //     {Object.entries(item.packageJson.dependencies).map(([depName, depVersion]) => (
  //       <Table.Td key={depName}>
  //         {depName} {depVersion}
  //       </Table.Td>
  //     ))}
  //     {/* <Table.Td>{item.name}</Table.Td>
  //     <Table.Td>{item.symbol}</Table.Td>
  //     <Table.Td>{item.mass}</Table.Td> */}
  //   </Table.Tr>
  // ));

  // Row Data: The data to be displayed.
  // const [rowData, setRowData] = useState([
  //   { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
  //   { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
  //   { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
  // ]);

  // // Column Definitions: Defines the columns to be displayed.
  // const [colDefs, setColDefs] = useState([
  //   { field: 'make' },
  //   { field: 'model' },
  //   { field: 'price' },
  //   { field: 'electric' },
  // ]);

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
    width: 100,
    comparator: (valueA: string, valueB: string) =>
      semverCompare(
        valueA?.replaceAll(/[^(\d|.)]/g, '') || '',
        valueB?.replaceAll(/[^(\d|.)]/g, '') || ''
      ),
  }));

  console.log({ occurrencies, sortedOccurrencies });

  return (
    <div
      className="ag-theme-quartz" // applying the grid theme
      style={{ height: 500 }} // the grid will fill the size of the parent container
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={[
          { field: 'repoName' },
          { ...columnDefs[0], sort: 'desc' },
          ...columnDefs.slice(1),
        ]}
        // autoSizeStrategy={{ type: 'fitCellContents', skipHeader: true, colIds: sortedOccurrencies }}
      />
    </div>
  );

  // return (

  //   <Table>
  //     <Table.Thead>
  //       <Table.Tr>
  //         <Table.Th>Repo Name</Table.Th>
  //         <Table.Th>Repo Name</Table.Th>
  //       </Table.Tr>
  //     </Table.Thead>
  //     <Table.Tbody>{rows}</Table.Tbody>
  //   </Table>
  // );
}

// function calc(head: Record<string, string>, tail: any[]) {
//   const a = Object.keys(head);

//   a.
// }
