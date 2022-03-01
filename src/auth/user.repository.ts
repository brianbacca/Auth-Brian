import { ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";

import { RegisterUserDto } from "./dto/registerUser.dto";
import { User } from "./entities";

@EntityRepository(User)
export class UserRepository extends Repository<User>{
    
   async  createUser(name:string, email:string, password:string, activationToken: string,){
     
        try {
          const user = this.create({name,email,password,activationToken} )
          console.log("USER-->", user)
          await this.save(user)
     delete user.password
     return user;
        } catch (err) {
             if(err.code === 'ER_DUP_ENTRY' ) {
                  throw new ConflictException("This is email already registered")
             }
             throw new InternalServerErrorException();
          // const a = 1
        }
    }

    async  findOneByEmail (email:string):Promise<User>{
         const user:User =  await this.findOne( {email})
         if(!user){
          throw new NotFoundException(`User with email ${email} not found`)
         }
         return user 
    }
    async activateUser(user: User): Promise<void> {
     user.active = true;
     this.save(user);
   }

 async findOneInactiveByIdAndActivationToken(id:string, code:string):Promise<User>{
     return this.findOne({id:id, activationToken:code, active:false})
 }

 async findOneByResetPasswordToken(resetPasswordToken: string):Promise<User>{
      const user:User =  await this.findOne({resetPasswordToken})
      if(!user){
           throw new NotFoundException()
      }

      return user;
 }
}