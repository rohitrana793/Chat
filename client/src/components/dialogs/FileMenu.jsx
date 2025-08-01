import { Menu } from "@mui/material";
import React from "react";

const FileMenu = ({ anchorE1 }) => {
  return (
    <Menu anchorEl={anchorE1} open={false}>
      <div
        style={{
          width: "10rem",
        }}
      >
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Minima commodi
        doloribus earum, exercitationem laboriosam aut dicta est delectus nam
        nemo? Magnam, modi repellendus. Nihil asperiores repellendus vitae,
        dolorem natus fugiat!
      </div>
    </Menu>
  );
};

export default FileMenu;
