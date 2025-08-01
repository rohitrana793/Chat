import React from "react";
import { Grid, Skeleton, Stack } from "@mui/material";
export const LayoutLoaders = () => {
  return (
    <Grid
      container
      height={"calc(100vh - 4rem)"}
      width={"100%"}
      spacing={"1rem"}
    >
      <Grid
        item
        xs={false}
        sm={4}
        md={3}
        height="100%"
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        <Skeleton variant="rectangular" />
      </Grid>

      <Grid item xs={12} sm={8} md={5} lg={6} height="100%">
        <Stack spacing={"1rem"}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={"5rem"} />
          ))}
        </Stack>
      </Grid>

      <Grid
        item
        xs={false}
        md={4}
        lg={3}
        height="100%"
        sx={{
          display: { xs: "none", md: "block" },
        }}
      >
        <Skeleton variant="rectangular" height={"100vh"} />
      </Grid>
    </Grid>
  );
};
