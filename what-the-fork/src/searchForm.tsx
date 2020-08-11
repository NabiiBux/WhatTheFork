import { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import React from "react";

export interface SearchFormParams {
    onSubmit: (evt: React.FormEvent<HTMLFormElement>) => void;
}

export function SearchForm(params: SearchFormParams) {
    const [url, changeUrl] = useState('RolandPheasant/TailBlazer');

    return (
        <form onSubmit={params.onSubmit}>
            Type or paste the url of a github repository:
            <InputGroup size="sm">
                <InputGroup.Prepend>
                    <InputGroup.Text id="basic-addon1">https://www.github.com/</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control size="sm" value={url} onChange={e => changeUrl(e.target.value)} />
                <InputGroup.Append>
                    <Button type="submit">Fork it</Button>
                </InputGroup.Append>
            </InputGroup>
        </form>
    )
}