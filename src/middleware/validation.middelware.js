// export const isValid = (schema) => {
//   return (req, res, next) => {
//     const validationResult = schema.validate(
//       { ...req.body, ...req.params, ...req.query },
//       { abortEarly: false }
//     );
//     if (validationResult.error) {
//       const errorMessage = validationResult.error.details.map((obj) => {
//         return obj.message;
//       });
//       return next(new Error(errorMessage));
//     }
//     return next();
//   };
// };

import { Types } from "mongoose";

export const isValidObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("Invalid objectId");
};

export const isValid = (schema) => {
  return (req, res, next) => {
    const copyReq = { ...req.body, ...req.params, ...req.query };

    const validationResults = schema.validate(copyReq, { abortEarly: true });

    if (validationResults.error) {
      const message = validationResults.error.details.map(
        (error) => error.message
      );

      return next(new Error(message, { cause: 404 }));
    }

    return next();
  };
};
