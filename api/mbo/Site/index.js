import { mboAxios } from "../utils.js";

const _createMBOLocationData = (rawLocations) => {
  const locations = {};
  rawLocations.forEach((location) => (locations[location.Id] = location.Name));
  return locations;
};

export default {
  getLocations: async () => {
    if (process.env.debug) console.log("getLocations");
    if (process.env.MBO_LOCATIONS) {
      return JSON.parse(process.env.MBO_LOCATIONS);
    }
    const { Locations } = await mboAxios("GET_LOCATIONS");
    if (!Locations) {
      return null;
    }
    const locations = _createMBOLocationData(Locations);
    process.env.MBO_LOCATIONS = JSON.stringify(locations);
    if (process.env.debug) console.log({ locations });
    return locations;
  },
};
