import axios from "axios";
import { capitalizeFirstLetter } from "../helper/helper";

const getPokemonList = async (url) => {
  const response = await axios.get(url);

  response.data.results = response.data.results.map((pokemon) => {
    return { id: getPokemonIdFromUrl(pokemon.url), ...pokemon };
  });

  return response.data.results;
};

const getPokemonDetails = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

const getPokemonIdFromUrl = (url) => {
  const urlSegments = url.split("/");
  // Handle trailing backslash
  const pokemonId = urlSegments.pop() || urlSegments.pop();
  return pokemonId;
};


const getPokemonEvolutions = async (url) => {
  const evolutions = [];
  const response = await axios.get(url);
  let evoData = response.data.chain;
  
  const traverseEvolutionTree = (node, level) => {
    // Is this even needed? Can't this be rendered immediately?
    evolutions[level].push({
      id: getPokemonIdFromUrl(node.species.url),
      species_name: node.species.name,
      min_level: node.evolution_details[0].min_level || 1, // Use the object directly instead of a const and with || rather than ternary
      trigger_name: node.evolution_details[0].trigger.name || null,
      item: node.evolution_details[0].item || null,
      min_happiness: node.evolution_details[0].min_happiness || null,
      time_of_day: node.evolution_details[0].time_of_day || null,
      known_move: node.evolution_details[0].known_move || null,
      known_move_type: node.evolution_details[0].known_move_type || null,
      held_item: node.evolution_details[0].held_item || null,
      location: node.evolution_details[0].location || null,
      needs_overworld_rain: node.evolution_details[0].needs_overworld_rain || null // Don't end with comma's and keep style consistent
    });
    node.evolves_to.forEach((child) => traverseEvolutionTree(child, level + 1));
  };

  traverseEvolutionTree(evoData, 0);
  return evolutions;
};

const formatPokemonName = (name) => {
  const hyphenExceptions = ['ho-oh', 'porygon-z', 'wo-chien', 'chien-pao', 'ting-lu'];
  const capitalizeFirstLetterExceptions = ['jangmo-o', 'kommo-o', 'hakamo-o'];
  const dotExceptions = ['mr-mime', 'mime-jr', 'mr-rime'];

  // These can be collapsed into a single case. Why was this done anyway?
  return name
    .toLowerCase()
    .split("-")
    .map((s) => {
      if (s === "m") {
        return "♂";
      } else if (s === "f") {
        return "♀";
      }
      return s.charAt(0).toUpperCase() + s.substring(1);
    })
    .join(" ");
};

const formatStatName = (name) => {
  if (name === "hp") return "HP";

  return name
    .toLowerCase()
    .split("-")
    .map((s) => {
      if (s === "special") return "Sp";
      return s.charAt(0).toUpperCase() + s.substring(1);
    })
    .join(" ");
};

const getJapaneseName = async (id) => {
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon-species/${id}`
  );
  return response.data.names[0].name;
};

export {
  getPokemonList,
  getPokemonDetails,
  getPokemonEvolutions,
  getJapaneseName,
  formatPokemonName,
  formatStatName,
};
