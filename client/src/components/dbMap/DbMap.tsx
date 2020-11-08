import React ,  {useEffect} from 'react'
import { fetchConstraints, fetchSchemas, fetchTables } from '../../api/Api';
import { ConstraintResponse, SchemaResponse, TableResponse } from '../../api/type';

interface Props {
}
const DbMap: React.FC<Props> = (props) => {
    useEffect(() => {
        fetchSchemas().then((res: SchemaResponse) => console.log(`All schemas`, res));
        fetchTables().then((res: TableResponse) => console.log(`All tables in all schemas:`, res));
        fetchTables('public').then((res: TableResponse) => console.log(`All tables of schema 'public':`, res));
        fetchConstraints().then((res: ConstraintResponse) => console.log(`All constraints in all schema and tables`, res));
        fetchConstraints('public', 'user').then((res: ConstraintResponse) => console.log(`All constraints pulic.user`, res));
        fetchConstraints('public', 'addresss').then((res: ConstraintResponse) => console.log(`All constraints pulic.address`, res));
    })
   return  <div>This is DbMap</div>
}

export default DbMap;