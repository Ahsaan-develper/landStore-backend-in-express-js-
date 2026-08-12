import { body , param , query } from "express-validator"


export const section_padding_validator = [
    
     body("top")
    .trim()
    .notEmpty().withMessage(" Please enter top padding ").bail(),

     body("bottom")
    .trim()
    .notEmpty().withMessage(" Please enter bottom padding ").bail(),

     body("left")
    .trim()
    .notEmpty().withMessage(" Please enter left padding ").bail(),

     body("right")
    .trim()
    .notEmpty().withMessage(" Please enter right padding ").bail(),
]

export const create_section_validator = [
    body("route")
    .trim()
    .notEmpty().withMessage(" Please enter route ").bail(),

    body("title")
    .trim()
    .notEmpty().withMessage("Please enter title here "),

    body("description")
    .trim()
    .notEmpty().withMessage("Please enter description")
]


export const create_container_validator = [

    body("background_color")
    .trim()
    .notEmpty().withMessage("Please enter background_color here "),

    body("container_alignment")
    .trim()
    .notEmpty().withMessage("Please enter alignment").bail()
    .isIn(["left" , "right" , "center"]).withMessage("Alignment must be left , right or center ")
]


export const section_id_validator = [
    param("section_id")
    .trim()
    .notEmpty().withMessage(" Please enter section id  ").bail()
    .isMongoId().withMessage(" Section is format not correct   ").bail(),
]


export const create_button_validator = [
    body("button_text")
    .trim()
    .notEmpty().withMessage("Please enter button text "),
    
    body("text_color")
    .trim()
    .notEmpty().withMessage("Please enter button text color code  "),

    body("button_link")
    .trim()
    .notEmpty().withMessage("Please enter button link   "),

    body("background_color")
    .trim()
    .notEmpty().withMessage("Please enter background color code  "),

    body("border_color")
    .trim()
    .notEmpty().withMessage("Please enter button border color  "),
    
]


export const create_statistic_content_validator =[
    body("heading")
    .trim()
    .notEmpty().withMessage("Please enter heading text  "),

    body("heading_color")
    .trim()
    .notEmpty().withMessage("Please enter heading color  "),

    body("heading_alignment")
    .trim()
    .notEmpty().withMessage("Please enter heading alignment").bail()
    .isIn(["center" , "left" ,"right"]),

    body("description")
    .trim()
    .notEmpty().withMessage("Please enter description of content  "),

    body("description_color")
    .trim()
    .notEmpty().withMessage("Please enter description color   "),

    body("description_alignment")
    .trim()
    .notEmpty().withMessage(" Please enter description alignment ").bail()
    .isIn(["center" , "left" ,"right"]),

    body("card_gap")
    .trim()
    .notEmpty().withMessage("Please enter card gap "),
]