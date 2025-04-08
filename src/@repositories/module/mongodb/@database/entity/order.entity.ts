export const SERVICE_DEFAULT = {
    _id: null,
    id_service: null,
    type_partner: null,
    time_schedule: null,
    optional_service: [
        // {
        //     _id: { type: mongoose.Schema.Types.ObjectId, ref: "OptionalService" },
        //     type: { type: String },
        //     title: {
        //         vi: String,
        //         en: String,
        //     },
        //     description: {
        //         vi: String,
        //         en: String,
        //     },
        //     extend_optional: {
        //         type: [{
        //             _id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExtendOptional' },
        //             title: {
        //                 vi: String,
        //                 en: String,
        //             },
        //             description: {
        //                 vi: String,
        //                 en: String,
        //             },
        //             price: Number,
        //             count: Number,
        //             estimate: Number,
        //             platform_fee: Number,
        //             personal: Number,
        //             id_extend_optional: { type: [Object], default: [] },
        //             thumbnail: String,
        //             is_hide_collaborator: Boolean
        //         }]
        //     }
        // }
    ]
}