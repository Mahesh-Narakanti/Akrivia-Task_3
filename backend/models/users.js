const { Model } = require('objection');
class users extends Model{
    static get tableName() {
        return 'users';
    }
}
module.exports = users;