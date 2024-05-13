import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Grid,
    Typography,
} from "@mui/material";
import React from "react";
import { useHistory } from "react-router-dom";

export const toTitleCase = (str) => {
    return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

const CalendarCard = ({ calendar }) => {
    const history = useHistory();

    const navigateTo = (path) => {
        history.push(path);
    };

    return (
        <>
            <Card
                sx={{ mt: 2, mb: 2 }}
                onClick={() => navigateTo(`/calendar-manage/${calendar.key}`)}
            >
                <CardActionArea>
                    <Grid container spacing={2} key={calendar.name}>
                        <Grid item>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {calendar.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {calendar.subcribers || "No Subcriber"}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Created by: {calendar.email}
                                </Typography>
                            </CardContent>
                        </Grid>
                        <Grid item>
                            <Box my={1} mr={1}>
                                {calendar.profileUrl && (
                                    <CardMedia
                                        sx={{
                                            borderRadius: 2,
                                            aspectRatio: "1/1",
                                        }}
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
        </>
    );
};

export default CalendarCard;
