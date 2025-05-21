// interfaces/user-request.interface.ts
import { User } from '../../users/user.entity';

export interface UserRequest extends Request {
    user: User;
}