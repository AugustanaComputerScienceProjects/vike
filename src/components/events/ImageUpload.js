import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { Box, IconButton, Typography } from "@mui/material";
import React from "react";

const ImageUpload = ({ image64, onImageUpload, onImageDrop }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        mt: 1,
        mb: 2,
      }}
      onDrop={onImageDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      {image64 ? (
        <img
          src={image64}
          alt="Event"
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      ) : (
        <Typography variant="body1" component="div" align="center">
          Drag and drop an image here or click the button below to upload
        </Typography>
      )}
      <IconButton
        component="label"
        sx={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          backgroundColor: "primary.main",
          color: "white",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
        }}
      >
        <AddPhotoAlternateIcon />
        <input type="file" accept="image/*" hidden onChange={onImageUpload} />
      </IconButton>
    </Box>
  );
};

export default ImageUpload;
