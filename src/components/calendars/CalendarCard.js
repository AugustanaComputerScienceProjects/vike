import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Dialog,
    Grid,
    Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import CalendarView from "./CalendarView";

export const toTitleCase = (str) => {
    return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

const CalendarCard = ({ calendar }) => {
    const history = useHistory();
    const [openPreview, setOpenPreview] = useState(false);
  
    const navigateTo = (path) => {
        history.push(path);
    }

    const togglePreview = () => {
        setOpenPreview(!openPreview);
    }

    // const handleCardClick = () => {
    //     history.push(`/calendar-manage/${calendar.id}`);
    // };


    return (
        <>
            <Card sx={{ mt: 2, mb: 2 }} onClick={() => navigateTo(`/calendar-manage/${calendar.key}`)}>
                <CardActionArea>
                    <Grid container spacing={2} key={calendar.name}>
                        <Grid item>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {calendar.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {calendar.subcriber || "No Subcriber"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Created by: {calendar.email}
                                </Typography>
                            </CardContent>
                        </Grid>
                        <Grid item >
                            <Box my={1} mr={1}>
                                {calendar.profileUrl && (
                                <CardMedia
                                    sx={{ borderRadius: 2, aspectRatio: '1/1' }}
                                    component="img"
                                    height="100"
                                    image={calendar.profileUrl}
                                    alt={calendar.name}
                                />
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardActionArea>
            </Card>

            {/* <Dialog open={openPreview} onClose={togglePreview}>
                <CalendarView event={calendar} />
            </Dialog> */}
        </>
    )
}

export default CalendarCard;