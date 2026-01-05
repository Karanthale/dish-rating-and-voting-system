import bcrypt from 'bcryptjs';

const password = 'Admin@123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('='.repeat(60));
console.log('ADMIN ACCOUNT SETUP');
console.log('='.repeat(60));
console.log('Email: admin@mess.edu');
console.log('Password: Admin@123');
console.log('='.repeat(60));
console.log('\nHashed Password:');
console.log(hashedPassword);
console.log('\n' + '='.repeat(60));
