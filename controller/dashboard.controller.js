import listingModel from "../models/listing.model.js";
import usersModel from "../models/users.model.js";
import { BadRequestError } from "../utils/error.utils.js";
export const get_user_growth_statistics = async (req, res, next) => {

    try {

        const {
            period = "12_months"
        } = req.query;
        const now = new Date();

        let currentStart;
        let previousStart;
        let previousEnd;

        if (period === "24_hours") {

            currentStart = new Date(now);
            currentStart.setHours(
                currentStart.getHours() - 24
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);
            previousStart.setHours(
                previousStart.getHours() - 24
            );


        } else if (period === "7_days") {

            currentStart = new Date(now);
            currentStart.setDate(
                currentStart.getDate() - 7
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);
            previousStart.setDate(
                previousStart.getDate() - 7
            );


        } else if (period === "30_days") {

            currentStart = new Date(now);
            currentStart.setDate(
                currentStart.getDate() - 30
            );
            previousEnd = new Date(currentStart);
            previousStart = new Date(previousEnd);
            previousStart.setDate(
                previousStart.getDate() - 30
            );
        } else if (period === "12_months") {

            currentStart = new Date(now);
            currentStart.setFullYear(
                currentStart.getFullYear() - 1
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);
            previousStart.setFullYear(
                previousStart.getFullYear() - 1
            );
        } else {
            return res.status(400).json({
                message:
                    "Invalid period. Use 24_hours, 7_days, 30_days or 12_months."
            });
        }
        const statistics =
            await usersModel.aggregate([
                {
                    $match: {
                        is_verify: true,
                        role: {
                            $in: [
                                "individual",
                                "koperasi",
                                "company"
                            ]
                        },
                        createdAt: {
                            $gte: previousStart,
                            $lte: now
                        }
                    }
                },
                {
                    $facet: {
                        current: [

                            {
                                $match: {

                                    createdAt: {
                                        $gte: currentStart,
                                        $lte: now
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: "$role",
                                    totalUsers: {
                                        $sum: 1
                                    }
                                }
                            }
                        ],
                        previous: [
                            {
                                $match: {
                                    createdAt: {
                                        $gte: previousStart,
                                        $lt: previousEnd
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: "$role",
                                    totalUsers: {
                                        $sum: 1
                                    }
                                }

                            }

                        ]

                    }

                }

            ]);
        const current =
            statistics[0]?.current || []
        const previous =
            statistics[0]?.previous || [];
        const currentUsers = {
            individual: 0,
            kopeisk: 0,
            company: 0
        };
        const previousUsers = {
            individual: 0,
            koperasi: 0,
            company: 0
        };
        current.forEach(item => {
            currentUsers[item._id] =
                item.totalUsers;
        });
        previous.forEach(item => {
            previousUsers[item._id] =
                item.totalUsers;
        });
        const calculateGrowth = (
            current,
            previous
        ) => {
            // If previous period has no users
            if (previous === 0) {
                if (current === 0) {
                    return 0;
                }
                return 100;
            }
            return Number(
                (
                    (
                        current - previous
                    ) / previous
                ) * 100
            ).toFixed(2);
        };
        const users = {
            individual: {
                current:
                    currentUsers.individual,

                previous:
                    previousUsers.individual,

                growth:
                    Number(
                        calculateGrowth(
                            currentUsers.individual,
                            previousUsers.individual
                        )
                    )

            },
            koperasi: {

                current:
                    currentUsers.koperasi,

                previous:
                    previousUsers.koperasi,

                growth:
                    Number(
                        calculateGrowth(
                            currentUsers.koperasi,
                            previousUsers.koperasi
                        )
                    )
            },
            company: {
                current:
                    currentUsers.company,
                previous:
                    previousUsers.company,
                growth:
                    Number(
                        calculateGrowth(
                            currentUsers.company,
                            previousUsers.company
                        )
                    )
            }
        };
        const currentTotal =
            currentUsers.individual +
            currentUsers.koperasi +
            currentUsers.company;
        const previousTotal =
            previousUsers.individual +
            previousUsers.koperasi +
            previousUsers.company;
        const totalGrowth =
            Number(
                calculateGrowth(
                    currentTotal,
                    previousTotal
                )
            );
        return res.status(200).json({
            message:
                "User growth statistics fetched successfully.",
            period,
            currentPeriod: {
                start: currentStart,
                end: now
            },
            previousPeriod: {
                start: previousStart,
                end: previousEnd
            },
            total: {
                current:
                    currentTotal,
                previous:
                    previousTotal,
                growth:
                    totalGrowth
            },
            users
        });
    } catch (error) {
        next(error);
    }
};

export const get_active_listing_statistics = async (req, res, next) => {

    try {

        const {
            period = "12_months"
        } = req.query;


        const now = new Date();

        let currentStart;
        let previousStart;
        let previousEnd;

        if (period === "24_hours") {

            currentStart = new Date(now);

            currentStart.setHours(
                currentStart.getHours() - 24
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);

            previousStart.setHours(
                previousStart.getHours() - 24
            );


        } else if (period === "7_days") {

            currentStart = new Date(now);

            currentStart.setDate(
                currentStart.getDate() - 7
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);

            previousStart.setDate(
                previousStart.getDate() - 7
            );


        } else if (period === "30_days") {

            currentStart = new Date(now);

            currentStart.setDate(
                currentStart.getDate() - 30
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);

            previousStart.setDate(
                previousStart.getDate() - 30
            );


        } else if (period === "12_months") {

            currentStart = new Date(now);

            currentStart.setFullYear(
                currentStart.getFullYear() - 1
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);

            previousStart.setFullYear(
                previousStart.getFullYear() - 1
            );


        } else {

            return res.status(400).json({

                message:
                    "Invalid period. Use 24_hours, 7_days, 30_days or 12_months."

            });

        }

        const statistics =
            await listingModel.aggregate([

                {
                    $match: {

                        status: "active",

                        createdAt: {
                            $gte: previousStart,
                            $lte: now
                        }

                    }
                },


                {
                    $facet: {

                        current: [

                            {
                                $match: {

                                    createdAt: {
                                        $gte: currentStart,
                                        $lte: now
                                    }

                                }
                            },


                            {
                                $count: "total"

                            }

                        ],

                        previous: [

                            {
                                $match: {

                                    createdAt: {
                                        $gte: previousStart,
                                        $lt: previousEnd
                                    }

                                }
                            },


                            {
                                $count: "total"

                            }

                        ]

                    }

                }

            ]);


        const currentListings =
            statistics[0]?.current?.[0]?.total || 0;


        const previousListings =
            statistics[0]?.previous?.[0]?.total || 0;

        let growth = 0;


        if (previousListings === 0) {

            if (currentListings > 0) {

                growth = 100;

            }

        } else {

            growth =
                (
                    (
                        currentListings -
                        previousListings
                    ) /
                    previousListings
                ) * 100;

        }


        growth =
            Number(
                growth.toFixed(2)
            );

        return res.status(200).json({

            message:
                "Active listing statistics fetched successfully.",

            period,

            currentPeriod: {

                start:
                    currentStart,

                end:
                    now

            },

            previousPeriod: {

                start:
                    previousStart,

                end:
                    previousEnd

            },

            activeListings:
                currentListings,

            previousActiveListings:
                previousListings,

            growth

        });


    } catch (error) {

        next(error);

    }

};

export const get_single_user_statistics = async (req, res, next) => {
    try {

        const {
            role = "individual",
            period
        } = req.query;


        const allowedRoles = [
            "individual",
            "koperasi",
            "company"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message:
                    "Invalid role. Use individual, koperasi or company."
            });
        }

        const baseMatch = {
            is_verify: true,
            role
        };


        if (!period) {

            const now = new Date();

            const previous12MonthsStart = new Date(now);

            previous12MonthsStart.setFullYear(
                previous12MonthsStart.getFullYear() - 1
            );

            const statistics = await usersModel.aggregate([

                {
                    $match: baseMatch
                },

                {
                    $facet: {

                        allTime: [
                            {
                                $count: "total"
                            }
                        ],


                        previous12Months: [
                            {
                                $match: {
                                    createdAt: {
                                        $gte: previous12MonthsStart,
                                        $lte: now
                                    }
                                }
                            },
                            {
                                $count: "total"
                            }
                        ]

                    }
                }

            ]);

            const allTime =
                statistics[0]?.allTime[0]?.total || 0;

            const previous12Months =
                statistics[0]?.previous12Months[0]?.total || 0;
            let growth = 0;

            if (previous12Months === 0) {

                growth = allTime > 0 ? 100 : 0;

            } else {

                growth = Number(
                    (
                        (
                            allTime - previous12Months
                        ) /
                        previous12Months
                    ) * 100
                ).toFixed(2);

            }

            return res.status(200).json({

                message:
                    "User statistics fetched successfully.",

                role,

                period: "all_time",

                total: {
                    current: allTime,
                    previous: previous12Months,
                    growth
                }

            });

        }

        const now = new Date();

        let currentStart;
        let previousStart;
        let previousEnd;

        if (period === "24_hours") {

            currentStart = new Date(now);

            currentStart.setHours(
                currentStart.getHours() - 24
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);

            previousStart.setHours(
                previousStart.getHours() - 24
            );
        }

        else if (period === "7_days") {

            currentStart = new Date(now);

            currentStart.setDate(
                currentStart.getDate() - 7
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);

            previousStart.setDate(
                previousStart.getDate() - 7
            );

        }

        else if (period === "30_days") {

            currentStart = new Date(now);

            currentStart.setDate(
                currentStart.getDate() - 30
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);

            previousStart.setDate(
                previousStart.getDate() - 30
            );

        }

        else if (period === "12_months") {

            currentStart = new Date(now);

            currentStart.setFullYear(
                currentStart.getFullYear() - 1
            );

            previousEnd = new Date(currentStart);

            previousStart = new Date(previousEnd);

            previousStart.setFullYear(
                previousStart.getFullYear() - 1
            );

        }

        else {

            return res.status(400).json({
                message:
                    "Invalid period. Use 24_hours, 7_days, 30_days or 12_months."
            });

        }

        const statistics = await usersModel.aggregate([

            {
                $match: {
                    ...baseMatch,

                    createdAt: {
                        $gte: previousStart,
                        $lte: now
                    }
                }
            },

            {
                $facet: {

                    current: [

                        {
                            $match: {
                                createdAt: {
                                    $gte: currentStart,
                                    $lte: now
                                }
                            }
                        },

                        {
                            $count: "total"
                        }

                    ],

                    previous: [

                        {
                            $match: {
                                createdAt: {
                                    $gte: previousStart,
                                    $lt: previousEnd
                                }
                            }
                        },

                        {
                            $count: "total"
                        }

                    ]

                }
            }

        ]);

        const current =
            statistics[0]?.current[0]?.total || 0;

        const previous =
            statistics[0]?.previous[0]?.total || 0;

        let growth = 0;

        if (previous === 0) {

            growth = current > 0 ? 100 : 0;

        } else {

            growth = Number(
                (
                    (
                        current - previous
                    ) /
                    previous
                ) * 100
            ).toFixed(2);

        }
        return res.status(200).json({

            message:
                "User statistics fetched successfully.",

            role,

            period,

            currentPeriod: {
                start: currentStart,
                end: now
            },

            previousPeriod: {
                start: previousStart,
                end: previousEnd
            },

            total: {
                current,
                previous,
                growth
            }

        });

    } catch (error) {
        next(error);
    }
};

