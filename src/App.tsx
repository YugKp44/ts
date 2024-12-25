import React from "react";
import "./style.css";
import { Autocomplete, TAutocomplete } from "./Autocomplete";

export default function App() {
  const handleSubmit = ({ value, query, queries }: TAutocomplete) => {
    // Query has been clicked if query in undefined.
    console.log(value, query, queries);
  };

  return (
    <div className="App">
      <Autocomplete
        onSubmit={handleSubmit}
        placeholder="Enter a brand to get started..."
      />
    </div>
  );
}
