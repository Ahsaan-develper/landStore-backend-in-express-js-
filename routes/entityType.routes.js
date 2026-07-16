import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { entity_param_validator, entity_validator } from "../middleware/validators/entity.validator.js";
import { handleUserAuthError } from "../middleware/validators/errorHandler.validator.js";
import { add_entity, delete_entity, get_all_entities, update_entity } from "../controller/entityType.controller.js";

export const entity_router = Router();

// create entity 

entity_router.post("/" , verify_token ,authorize("admin") , entity_validator ,  handleUserAuthError , add_entity)

// get all entities 

entity_router.get("/" , get_all_entities);

// update entity 

entity_router.patch("/:id" , verify_token , authorize("admin") , entity_validator , handleUserAuthError , update_entity);

// delete an entity 

entity_router.delete("/:id" , verify_token ,authorize("admin") , entity_param_validator , handleUserAuthError , delete_entity);