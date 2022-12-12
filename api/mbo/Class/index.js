import { mboAxios } from "../utils.js";
import Site from "../Site/index.js";

const _createMBOClassScheduleData = async (classes) => {
  const locations = await Site.getLocations();
  return classes.map((classData) => {
    return {
      ClassId: classData.Id,
      MaxCapacity: classData.MaxCapacity,
      TotalBooked: classData.TotalBooked,
      StartDateTime: classData.StartDateTime,
      EndDateTime: classData.EndDateTime,
      Location: locations[classData.Location.Id],
      Name: classData.ClassDescription.Name,
    };
  });
};

export default {
  addClientToClass: async (ClientId, ClassId) => {
    if (process.env.debug) console.log("addClientToClass", ClientId, ClassId);
    return await mboAxios("POST_ADD_CLIENT_TO_CLASS", {
      ClientId,
      ClassId,
    });
  },
  removeClientFromClass: async (ClientId, ClassId) => {
    if (process.env.debug)
      console.log("removeClientFromClass", ClientId, ClassId);
    return await mboAxios("POST_REMOVE_CLIENT_FROM_CLASS", {
      ClientId,
      ClassId,
    });
  },
  getClassScheduleId: async (ClassId) => {
    if (process.env.debug) console.log("getClassScheduleId", ClassId);
    const { Classes } = await mboAxios("GET_CLASSES", { ClassIds: ClassId });
    if (!Classes) {
      return null;
    }
    if (process.env.debug) console.log({ Classes });
    return Classes[0].ClassScheduleId;
  },
  getClassesByScheduleId: async (classScheduleId, startDate, endDate) => {
    if (process.env.debug)
      console.log("getClassesByScheduleId", classScheduleId);
    const { Classes } = await mboAxios("GET_CLASSES", {
      classScheduleIds: classScheduleId,
      StartDateTime: new Date(startDate).toISOString(),
      EndDateTime: new Date(endDate).toISOString(),
    });
    if (!Classes) {
      return null;
    }
    if (process.env.debug) console.log({ Classes });
    return await _createMBOClassScheduleData(Classes);
  },
};
