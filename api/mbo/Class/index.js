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
    return await mboAxios("POST_ADD_CLIENT_TO_CLASS", {
      ClientId,
      ClassId,
    });
  },
  removeClientFromClass: async (ClientId, ClassId) => {
    return await mboAxios("POST_REMOVE_CLIENT_FROM_CLASS", {
      ClientId,
      ClassId,
    });
  },
  getClassScheduleId: async (ClassId) => {
    const endDate = new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000);
    const { Classes } = await mboAxios("GET_CLASSES", {
      ClassIds: ClassId,
      EndDateTime: endDate.toISOString(),
    });
    if (!Classes) {
      return null;
    }
    return Classes[0].ClassScheduleId;
  },
  getClassesByScheduleId: async (targetClasses) => {
    const endDate = new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000);
    const classScheduleId = targetClasses[0].ClassScheduleId;

    const { Classes } = await mboAxios("GET_CLASSES", {
      classScheduleIds: classScheduleId,
      EndDateTime: endDate.toISOString(),
    });
    if (!Classes) {
      return null;
    }
    return await _createMBOClassScheduleData(Classes);
  },
};
