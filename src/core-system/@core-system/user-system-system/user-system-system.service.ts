import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'

@Injectable()
export class UserSystemSystemService {
  constructor(
    private customExceptionService: CustomExceptionService,
    private userSystemOoopSystemService: UserSystemOoopSystemService,
){}

    async updateSessionSocketAdmin(client, isDisconnect: boolean = true) {
        try {
            if (client.payload) {
                // 1. Lay thong tin Admin
                let getAdmin = await this.userSystemOoopSystemService.getDetailItemForWebSocket(client.payload._id);
                
                // 2.
                // Neu khong co Admin
                if (!getAdmin) {
                    return null
                }
                
                // Neu co thi cap nhat session_socket cho Admin
                getAdmin = await this.userSystemOoopSystemService.updateSocketAdmin('vi', client.payload._id, isDisconnect, client.id)
        
                return getAdmin
            } else {
                return null
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
