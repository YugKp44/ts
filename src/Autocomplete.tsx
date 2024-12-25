import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from "react";
import './autocomplete.css';
import {
  SWrapper,
  SQueriesWrapper,
  SQueries,
  SQueryImage,
  SQueryDomain,
  SNotFoundIcon,
  SQueryName,
  SQuery,
  SLabelPrefix,
  SLabelSuffix,
  SNotFound,
  SInput
} from "./Autocomplete.style";
import { faMagnifyingGlass, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type TQuery = {
  name: string;
  domain: string;
  icon: string;
};

export type TAutocomplete = {
  value: string;
  query?: TQuery;
  queries: TQuery[];
};

interface IAutocomplete {
  onSubmit: ({ value, queries, query }: TAutocomplete) => void;
  placeholder: string;
}

export const Autocomplete = ({ onSubmit, placeholder }: IAutocomplete) => {
  const [value, setValue] = useState({ text: "", active: false });
  const [queries, setQueries] = useState<TQuery[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<TQuery | null>(null);

  // Load persisted data on mount
  useEffect(() => {
    const storedQueries = localStorage.getItem("queries");
    const storedSelectedLogo = localStorage.getItem("selectedLogo");
    const storedValue = localStorage.getItem("inputValue");

    if (storedQueries) setQueries(JSON.parse(storedQueries));
    if (storedSelectedLogo) setSelectedLogo(JSON.parse(storedSelectedLogo));
    if (storedValue) setValue(JSON.parse(storedValue));
  }, []);

  // Persist data whenever it changes
  useEffect(() => {
    localStorage.setItem("queries", JSON.stringify(queries));
    localStorage.setItem("selectedLogo", JSON.stringify(selectedLogo));
    localStorage.setItem("inputValue", JSON.stringify(value));
  }, [queries, selectedLogo, value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = queries?.[0]?.domain || value.text;
    onSubmit({ value: text, query: undefined, queries });
    setValue({ text, active: false });
    setQueries([]);
  };

  const handleClick = (query: TQuery) => {
    setSelectedLogo(query); // Set the selected logo
    setValue({ ...value, active: false }); // Hide the suggestion box
  };

  const reset = () => {
    setQueries([]);
    setValue({ text: "", active: false });
    setSelectedLogo(null); // Clear selected logo
    localStorage.clear(); // Clear localStorage if reset
  };

  const getQueries = useCallback(async (searchValue: string) => {
    if (searchValue !== "") {
      try {
        const url = `https://api.brandfetch.io/v2/search/${searchValue}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setQueries(data);
        }
      } catch (err) {
        console.log("Something went wrong, try again later.");
      }
      return;
    }
    setQueries([]);
  }, []);

  useEffect(() => {
    getQueries(value.text);
  }, [getQueries, value.text]);

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
  };

  return (
    <SWrapper>
      <form onSubmit={handleSubmit}>
        <SLabelPrefix>
          <FontAwesomeIcon size="sm" icon={faMagnifyingGlass} />
        </SLabelPrefix>

        <SInput
          placeholder={placeholder}
          value={value.text}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setValue({ text: e.target.value, active: true })
          }
        />

        {value.text !== "" && (
          <SLabelSuffix onClick={() => reset()}>
            <FontAwesomeIcon size="sm" icon={faTimes} />
          </SLabelSuffix>
        )}
      </form>

      {value.active && value.text !== "" && (
        <SQueriesWrapper>
          {queries.length ? (
            <SQueries>
              {queries.map((query, i) => (
                <SQuery key={i} onClick={() => handleClick(query)}>
                  <SQueryImage>
                    <img src={query.icon} alt={query.name} />
                  </SQueryImage>

                  <SQueryName>{query.name || query.domain}</SQueryName>

                  <SQueryDomain>{query.domain}</SQueryDomain>
                </SQuery>
              ))}
            </SQueries>
          ) : (
            <SNotFound>
              <SNotFoundIcon>
                <FontAwesomeIcon size="xl" icon={faMagnifyingGlass} />
              </SNotFoundIcon>

              <p className="bold">Nothing found...</p>

              <br />

              <p>Search by entering it’s website URL for better result.</p>
            </SNotFound>
          )}
        </SQueriesWrapper>
      )}

      {selectedLogo && (
        <div className="logo-container">
          <img src={selectedLogo.icon} alt={selectedLogo.name} />
          <p className="logo-name">{selectedLogo.name}</p>
          <button
            className="download-button"
            onClick={() => downloadImage(selectedLogo.icon, selectedLogo.name)}
          >
            Download Logo
          </button>
        </div>
      )}
    </SWrapper>
  );
};
