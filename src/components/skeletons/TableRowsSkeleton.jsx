import React from "react";
import { Skeleton, TableCell, TableRow } from "@mui/material";

const TableRowsSkeleton = ({
  columns = 6,
  rows = 6,
  avatarColumns = [],
  firstColumnWidth = "70%",
}) => {
  const avatarColumnSet = new Set(avatarColumns);

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((__, columnIndex) => {
            const isAvatarColumn = avatarColumnSet.has(columnIndex);

            return (
              <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
                {isAvatarColumn ? (
                  <Skeleton variant="circular" width={32} height={32} />
                ) : (
                  <Skeleton
                    variant="text"
                    height={30}
                    width={columnIndex === 0 ? firstColumnWidth : "60%"}
                  />
                )}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </>
  );
};

export default TableRowsSkeleton;
