import { useState } from "react";
import "./styles.css";

const SearchBar = ({ suggestions, moveToPoly }) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [input, setInput] = useState("");

    const onChange = (e) => {
        const userInput = e.target.value;
        const results = suggestions.features.map(feature => {
            return {
                id: feature.properties.id,
                text: Object.entries(feature.properties).map(i => {
                    return `${i[0]} ${i[1]}<br/>`
                }).join("")
            }
        })

        // Filter our suggestions that don't contain the user's input
        const unLinked = results.filter(suggestion =>
            suggestion.text.toLowerCase().indexOf(userInput.toLowerCase()) > -1,
        ).splice(0, 5)

        setInput(e.target.value);
        setFilteredSuggestions(unLinked);
        console.log('unLinked', unLinked);
        setActiveSuggestionIndex(0);
        setShowSuggestions(true);
    };

    const onClick = index => {

        if (!index) return;
        const sugg = suggestions.features[index]
        const addr = sugg.properties.address

        
        setFilteredSuggestions([]);
        setInput(addr);
        setActiveSuggestionIndex(0);
        setShowSuggestions(false);
        
        moveToPoly(sugg)
    };

    const onKeyDown = (e) => {

        const selected = filteredSuggestions[activeSuggestionIndex]
        if (!selected) return;

        const sugg = suggestions.features[selected.id]
        const addr = sugg.properties.address

        // User pressed the enter key
        if (e.keyCode === 13) {
            setInput(addr);
            setActiveSuggestionIndex(0);
            setShowSuggestions(false);
            moveToPoly(sugg)
        }
        // User pressed the up arrow
        else if (e.keyCode === 38) {
            if (activeSuggestionIndex === 0) {
                return;
            }
            setActiveSuggestionIndex(activeSuggestionIndex - 1);
        }
        // User pressed the down arrow
        else if (e.keyCode === 40) {
            if (activeSuggestionIndex - 1 === filteredSuggestions.length) return;
            //if (activeSuggestionIndex + 1 > filteredSuggestions.length) return;

            console.log('activeSuggestionIndex', activeSuggestionIndex);
            console.log('filteredSuggestions.length', filteredSuggestions.length);

            setActiveSuggestionIndex(activeSuggestionIndex + 1);
        }
    };

    const SuggestionsListComponent = () => {
        return filteredSuggestions.length ? (
            <ul class="suggestions">
                {filteredSuggestions.map((suggestion, index) => {
                    let className;

                    // Flag the active suggestion with a class
                    if (index === activeSuggestionIndex) {
                        className = "suggestion-active";
                    }

                    const hightlitexText = updateHaystack(suggestion.text, input)

                    return (
                        <li className={className}
                            key={suggestion.text}
                            onClick={() => onClick(suggestion.id)}
                            dangerouslySetInnerHTML={{ __html: hightlitexText }}>
                        </li>
                    );
                })}
            </ul>
        ) : (
            <div class="no-suggestions">
                <em>sorry no suggestions</em>
            </div>
        );
    };

    return (
        <>
            <input
                type="text"
                onChange={onChange}
                onKeyDown={onKeyDown}
                value={input}
            />
            {showSuggestions && input && <SuggestionsListComponent />}
        </>
    );
};

function updateHaystack(input, needle) {
    return input.replace(new RegExp('(^|)(' + needle + ')(|$)', 'ig'), '$1<b>$2</b>$3');
}

export default SearchBar;
