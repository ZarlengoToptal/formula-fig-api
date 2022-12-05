import { mboAxios } from "../utils.js";
import Site from "../Site/index.js";

const _getMBOVisitsData = async (visits) => {
  const locations = await Site.getLocations();
  const allVisits = visits.map((visit) => {
    return {
      ClassId: visit.ClassId,
      StartDate: visit.StartDateTime,
      EndDate: visit.EndDateTime,
      SiteId: visit.SiteId,
      Location: locations[visit.LocationId],
      Name: visit.Name,
    };
  });
  return {
    Appointments: allVisits.filter(
      (visit) => new Date(visit.StartDate) >= new Date()
    ),
    History: allVisits.filter(
      (visit) => new Date(visit.StartDate) < new Date()
    ),
  };
};

export default {
  get: async (clientId) => {
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const startDate = new Date(new Date().getTime() - oneYear).toISOString();
    const endDate = new Date(new Date().getTime() + oneYear).toISOString();
    const { Visits } = await mboAxios("GET_CLIENT_VISITS", {
      ClientId: clientId,
      StartDate: startDate,
      EndDate: endDate,
    });
    return await _getMBOVisitsData(Visits);
  },
};
