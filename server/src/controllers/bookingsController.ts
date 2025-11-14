import {db} from '../config/db'; import {generatePNR} from '../utils/pnr';
export const bookFlight=async(req,res)=>{const b=req.body; const pnr=generatePNR(); await db.query(
 'INSERT INTO bookings (id,pnr,user_id,flight_id,passenger_name,passenger_email,seat_number,total_amount) VALUES (UUID(),?,?,?,?,?,?,?)',
 [pnr,b.userId,b.flightId,b.passenger_name,b.passenger_email,b.seat_number,b.total_amount]
); res.json({message:'Booking successful',pnr});};
export const getUserBookings=async(req,res)=>{const[r]=await db.query('SELECT * FROM bookings WHERE user_id=?',[req.params.userId]);res.json(r);};
export const cancelBooking=async(req,res)=>{await db.query('UPDATE bookings SET booking_status="Cancelled" WHERE id=?',[req.params.id]);res.json({message:'Cancelled'});};