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


export const section_padding_update_validator = [
    
     body("top")
     .optional()
    .trim()
    .notEmpty().withMessage(" Please enter top padding ").bail(),

     body("bottom")
     .optional()
    .trim()
    .notEmpty().withMessage(" Please enter bottom padding ").bail(),

     body("left")
     .optional()
    .trim()
    .notEmpty().withMessage(" Please enter left padding ").bail(),

     body("right")
     .optional()
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
    .notEmpty().withMessage(" Please provide background color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Background color code must as e.g. #ffffff"),

    body("container_alignment")
    .trim()
    .notEmpty().withMessage("Please enter alignment").bail()
    .isIn(["left" , "right" , "center"]).withMessage("Alignment must be left , right or center ")
]


export const update_container_validator = [

    body("background_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide background color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Background color code must as e.g. #ffffff"),

    body("container_alignment")
    .optional()
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


export const card_style_validator =[
    body("background_color")
    .trim()
    .notEmpty().withMessage(" Please provide background color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Background color code must as e.g. #ffffff"),
    body("border_color")
    .trim()
    .notEmpty().withMessage(" Please provide border color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Border color code must as e.g. #ffffff"),
]

export const card_style_update_validator =[
    body("background_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide background color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Background color code must as e.g. #ffffff"),
    body("border_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide border color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Border color code must as e.g. #ffffff"),
]

export const create_button_validator = [
    body("button_text")
    .trim()
    .notEmpty().withMessage("Please enter button text "),
    
    body("text_color")
    .trim()
    .notEmpty().withMessage(" Please provide button color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Button color code must as e.g. #ffffff"),

    body("button_link")
    .trim()
    .notEmpty().withMessage("Please enter button link   "),

    body("background_color")
    .trim()
    .notEmpty().withMessage(" Please provide background color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("background color code must as e.g. #ffffff"),

    body("border_color")
    .trim()
    .notEmpty().withMessage("Please enter button border color  "),
    
]

export const update_button_validator = [
    body("button_text")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter button text "),
    
    body("text_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide button color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Button color code must as e.g. #ffffff"),

    body("button_link")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter button link   "),

    body("background_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide background color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("background color code must as e.g. #ffffff"),

    body("border_color")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter button border color  "),
    
]

export const create_statistic_content_validator =[

    body("card_gap")
    .trim()
    .notEmpty().withMessage("Please enter card gap "),
]

export const update_statistic_content_validator =[

    body("card_gap")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter card gap "),
]



export const card_data_validator =[
     body("heading")
    .trim()
    .notEmpty().withMessage("Please enter heading text  "),

    body("heading_color")
    .trim()
    .notEmpty().withMessage(" Please provide heading color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Heading color code must as e.g. #ffffff"),

    body("heading_alignment")
    .trim()
    .notEmpty().withMessage("Please enter heading alignment").bail()
    .isIn(["center" , "left" ,"right"]),

    body("description")
    .trim()
    .notEmpty().withMessage("Please enter description of content  "),

    body("description_color")
    .trim()
    .notEmpty().withMessage(" Please provide description color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Description color code must as e.g. #ffffff"),

    body("description_alignment")
    .trim()
    .notEmpty().withMessage(" Please enter description alignment ").bail()
    .isIn(["center" , "left" ,"right"]),

    body("sub_heading")
    .optional()
    .custom((value, { req }) => {
    const {
        sub_heading,
        sub_heading_color,
        sub_heading_alignment
    } = req.body;

    
    if (!sub_heading && !sub_heading_color && !sub_heading_alignment) {
        return true;
    }

    if (!sub_heading || !sub_heading_color || !sub_heading_alignment) {
        throw new Error(
            "sub_heading, sub_heading_color and sub_heading_alignment are all required"
        );
    }

    if (!["center", "left", "right"].includes(sub_heading_alignment)) {
        throw new Error(
            "Sub heading alignment must be center, left or right"
        );
    }

    return true;
}),
]


export const card_data_update_validator =[
     body("heading")
     .optional()
    .trim()
    .notEmpty().withMessage("Please enter heading text  "),

    body("heading_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide heading color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Heading color code must as e.g. #ffffff"),

    body("heading_alignment")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter heading alignment").bail()
    .isIn(["center" , "left" ,"right"]),

    body("description")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter description of content  "),

    body("description_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide description color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Description color code must as e.g. #ffffff"),

    body("description_alignment")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter description alignment ").bail()
    .isIn(["center" , "left" ,"right"]),

    body("sub_heading")
    .optional()
    .custom((value, { req }) => {
    const {
        sub_heading,
        sub_heading_color,
        sub_heading_alignment
    } = req.body;

    
    if (!sub_heading && !sub_heading_color && !sub_heading_alignment) {
        return true;
    }

    if (!sub_heading || !sub_heading_color || !sub_heading_alignment) {
        throw new Error(
            "sub_heading, sub_heading_color and sub_heading_alignment are all required"
        );
    }

    if (!["center", "left", "right"].includes(sub_heading_alignment)) {
        throw new Error(
            "Sub heading alignment must be center, left or right"
        );
    }

    return true;
}),
]


export const  create_statistic_card_validator = [
    body("card_name")
    .trim()
    .notEmpty().withMessage("Please enter card Name "),
]

export const  create_news_category_validator = [
    body("category_name")
    .trim()
    .notEmpty().withMessage("Please enter category Name "),
]

export const  update_news_category_validator = [
    body("category_name")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter category Name "),
]
export const section_query_id_validator = [
    query("id")
    .trim()
    .notEmpty().withMessage("Please enter id ").bail()
    .isMongoId().withMessage("Id format not correct ")
]

export const create_testimonial_card_validator = [
    body("testimonial_name")
    .trim()
    .notEmpty("Please enter testimonial name "),

    body("testimonial")
    .trim()
    .notEmpty().withMessage(" Please enter testimonial "),

    body("testimonial_color")
    .trim()
    .notEmpty().withMessage(" Please provide testimonial color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Testimonial color code must as e.g. #ffffff"),

    body("testimonial_alignment")
    .trim()
    .notEmpty().withMessage(" Please enter testimonial alignment "),

    body("customer")
    .trim()
    .notEmpty().withMessage(" Please enter customer "),

    body("customer_color")
    .trim()
    .notEmpty().withMessage(" Please provide customer color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Customer color code must as e.g. #ffffff"),

    body("customer_alignment")
    .trim()
    .notEmpty().withMessage(" Please enter customer alignment  "),
    
    body("username")
    .trim()
    .notEmpty().withMessage(" Please enter username  "),

    body("username_color")
    .trim()
    .notEmpty().withMessage(" Please provide username color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Username color code must as e.g. #ffffff"),

    body("username_alignment")
    .trim()
    .notEmpty().withMessage(" Please enter username  alignment"),
]



export const update_testimonial_card_validator = [
    body("testimonial_name")
    .optional()
    .trim()
    .notEmpty("Please enter testimonial name "),

    body("testimonial")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter testimonial "),

    body("testimonial_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide testimonial color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Testimonial color code must as e.g. #ffffff"),

    body("testimonial_alignment")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter testimonial alignment "),

    body("customer")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter customer "),

    body("customer_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide customer color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Customer color code must as e.g. #ffffff"),

    body("customer_alignment")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter customer alignment  "),
    
    body("username")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter username  "),

    body("username_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide username color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Username color code must as e.g. #ffffff"),

    body("username_alignment")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter username  alignment"),
]




export const  create_menu_card_validator = [
    body("menu_name")
    .trim()
    .notEmpty().withMessage("Please enter menu card Name "),

    body("menu")
    .trim()
    .notEmpty().withMessage("Please enter menu  "),

    body("menu_color")
    .trim()
    .notEmpty().withMessage(" Please provide menu color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Menu color code must as e.g. #ffffff"),

    body("menu_alignment")
    .trim()
    .notEmpty().withMessage("Please enter menu alignment ").bail()
    .isIn(["center" , "left" , "right"]).withMessage("Please enter just center , left or right "),

    body("link")
    .trim()
    .notEmpty().withMessage("Please enter menu card link "),
]



export const  update_menu_card_validator = [
    body("menu_name")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter menu card Name "),

    body("menu")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter menu  "),

    body("menu_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide menu color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Menu color code must as e.g. #ffffff"),

    body("menu_alignment")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter menu alignment ").bail()
    .isIn(["center" , "left" , "right"]).withMessage("Please enter just center , left or right "),

    body("link")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter menu card link "),
]


export const news_card_validator = [
    body("link")
    .trim()
    .notEmpty().withMessage("Please enter link "),

    body("link_color")
    .trim()
    .notEmpty().withMessage(" Please provide link color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Link color code must as e.g. #ffffff"),

    body("link_alignment")
    .trim()
    .notEmpty().withMessage("Please enter link alignment "),

    body("date")
    .trim()
    .matches(/^\d{1,2}\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/i)
    .withMessage("Date must be in format: 16 Dec 2026")
    .custom(value => {
        const parsed = new Date(value);
        if (isNaN(parsed.getTime())) {
            throw new Error("Invalid date value");
        }
        if (parsed <= new Date()) {
            throw new Error("Date must be in the future");
        }
        return true;
    }),
    body("date_color")
    .trim()
    .notEmpty().withMessage(" Please provide date color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Date color code must as e.g. #ffffff"),
    body("date_alignment")
    .trim()
    .notEmpty().withMessage("Please enter date alignment "),
]

export const card_icon_validator = [
    body("card_icon")
    .trim()
    .notEmpty().withMessage(" Please enter card svg "),

    body("icon_color")
    .trim()
    .notEmpty().withMessage(" Please provide icon color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Icon color code must as e.g. #ffffff"),

    body("icon_alignment")
    .trim()
    .notEmpty().withMessage(" Please provide icon alignment")
    .isIn(["center" , "left" , "right"])
]


export const news_card_update_validator = [
    body("link")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter link "),

    body("link_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide link color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Link color code must as e.g. #ffffff"),

    body("link_alignment")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter link alignment "),

    body("date")
    .optional()
    .trim()
    .matches(/^\d{1,2}\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/i)
    .withMessage("Date must be in format: 16 Dec 2026")
    .custom(value => {
        const parsed = new Date(value);
        if (isNaN(parsed.getTime())) {
            throw new Error("Invalid date value");
        }
        if (parsed <= new Date()) {
            throw new Error("Date must be in the future");
        }
        return true;
    }),
    body("date_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide date color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Date color code must as e.g. #ffffff"),
    body("date_alignment")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter date alignment "),
]

export const card_icon_update_validator = [
    body("card_icon")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter card svg "),

    body("icon_color")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide icon color ").bail()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Icon color code must as e.g. #ffffff"),

    body("icon_alignment")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide icon alignment")
    .isIn(["center" , "left" , "right"])
]