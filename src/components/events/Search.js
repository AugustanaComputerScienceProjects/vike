import React, { useState } from 'react';
import { TextField, List, ListItem, ListItemText } from '@material-ui/core';

const Search = ({ events }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredEvents = events.filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <TextField
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <List>
                {filteredEvents.map((event) => (
                    <ListItem key={event.id}>
                        <ListItemText primary={event.name} />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default Search;