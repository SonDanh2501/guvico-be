export const LOOKUP_CUSTOMER = {
  from: "customers",
  localField: "id_customer",
  foreignField: "_id",
  as: "id_customer",
}

export const LOOKUP_GROUP_ID_CUSTOMER = {
  from: "customers",
  localField: "_id",
  foreignField: "_id",
  as: "id_customer",
}
export const LOOKUP_COLLABORATOR = {
  from: "collaborators",
  localField: "id_collaborator",
  foreignField: "_id",
  as: "id_collaborator",
}



export const LOOKUP_GROUP_ID_COLLABORATOR = {
  from: "collaborators",
  localField: "_id",
  foreignField: "_id",
  as: "id_collaborator",
}


export const LOOKUP_GROUP_ORDER = {
  from: "grouporders",
  localField: "_id",
  foreignField: "_id",
  as: "id_group_order",
}

export const LOOKUP_ADMIN_VERIFY = {
  from: "usersystems",
  localField: "id_admin_verify",
  foreignField: "_id",
  as: "id_admin_verify",
}

export const LOOKUP_ADMIN_ACTION = {
  from: "usersystems",
  localField: "id_admin_action",
  foreignField: "_id",
  as: "id_admin_action",
}

export const LOOKUP_ADMIN_REFUND = {
  from: "usersystems",
  localField: "id_admin_refund",
  foreignField: "_id",
  as: "id_admin_refund",
}

export const LOOKUP_REASON_CANCEL = {
  from: 'reasoncancels',
  localField: 'tempId',
  foreignField: '_id',
  as: 'reason_cancel',
}

export const LOOKUP_ID_ORDER = {
  from: "orders",
  localField: "id_order",
  foreignField: "_id",
  as: "id_order",
}

export const LOOKUP_ID_REWARD_COLLABORATOR = {
  from: "rewardcollaborators",
  localField: "id_reward_collaborator",
  foreignField: "_id",
  as: "id_reward_collaborator",
}

export const LOOKUP_ID_REASON_CANCEL = {
  from: "reasoncancels",
  localField: "id_reason_cancel",
  foreignField: "_id",
  as: "id_reason_cancel",
}

export const LOOKUP_ID_SERVICE = {
  from: "services",
  localField: "service._id",
  foreignField: "_id",
  as: "id_service",
}

export const LOOKUP_SERVICE = {
  from: "services",
  localField: "_id",
  foreignField: "_id",
  as: "id_service",
}

export const LOOKUP_PUNISH = {
  from: "punishes",
  localField: "_id",
  foreignField: "id_order",
  pipeline: [
      {$match: { $expr: { $eq : [ '$status', 'done' ]  }} }
  ],
  as: "punish",

}

export const LOOKUP_TRANSACTION_PUNISH_DONE = {
  from: "transactions",
  localField: "_id",
  foreignField: "id_order",
  pipeline: [
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ["$status", "done"] },
            { $eq: ["$type_transfer", "punish"] }
          ]
        }
      }
    }
  ],
  as: "transactions_punish"
}

export const LOOKUP_PUNISH_TICKET_DONE = {
from: "punishtickets",
localField: "_id",
foreignField: "id_order",
pipeline: [
  {
    $match: {
      $expr: {
        $and: [
          { $eq: ["$status", "done"] },
          // {
          //   $eq: [
          //     "$id_collaborator",
          //     "$$idCollaborator"
          //   ]
          // }
          // { $eq: ["$type_transfer", "punish"] }
        ]
      }
    }
  }
],
as: "punish_ticket"
}

export const LOOKUP_PUNISH_TICKET_DONE_BY_COLLABORATOR = {
from: "punishtickets",
localField: "_id",
foreignField: "id_order",
let: {
  idCollaborator:
    "$id_collaborator"
},
pipeline: [
  {
    $match: {
      $expr: {
        $and: [
          { $eq: ["$status", "done"] },
          {
            $eq: [
              "$id_collaborator",
              "$$idCollaborator"
            ]
          }
          // { $eq: ["$type_transfer", "punish"] }
        ]
      }
    }
  }
],
as: "punish_ticket"
}

export const LOOKUP_TRANSACTION_PUNISH = {
    from: "transactions",
    localField: "_id",
    foreignField: "id_order",
    let: {
      idCollaborator:
        "$id_collaborator"
    },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$status", "done"] },
              { $eq: ["$type_transfer", "punish"] },
              {
                $eq: [
                  "$id_collaborator",
                  "$$idCollaborator"
                ]
              }
            ]
          }
        }
      }
    ],
    as: "transactions_punish"
}
