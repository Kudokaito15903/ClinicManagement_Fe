import { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { getRooms } from '@/api/rooms';
import type { Room } from '@/types';

interface Props {
    value: number | null;
    onChange: (id: number | null) => void;
    error?: string;
}

export default function RoomSelect({ value, onChange, error }: Props) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getRooms()
            .then(setRooms)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const selected = rooms.find((r) => r.id === value) ?? null;

    return (
        <Autocomplete
            options={rooms}
            value={selected}
            loading={loading}
            getOptionLabel={(r) => r.name}
            onChange={(_, v) => onChange(v ? v.id : null)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Phòng khám"
                    error={!!error}
                    helperText={error}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress size={16} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}
