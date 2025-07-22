0,0 @@
import { NextApiRequest, NextApiResponse } from 'next';
import { queryWithAudit } from '@/lib/db'; // Assuming you use path aliases
import { getUserIdFromRequest } from '@/lib/auth'; // Now this is a real function!
import { z } from 'zod';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  // 1. Get the user ID from the session or token
  // This is a crucial step. You need a function to securely get the current user.
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Define a schema for input validation
  const productUpdateSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
    price: z.number().positive({ message: "Price must be a positive number" }),
  });

  if (req.method === 'PUT') {
    try {
      // Validate the request body against the schema
      const validationResult = productUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
      }

      const { name, price } = validationResult.data;
      
      const queryText = 'UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *';
      const params = [name, price, id];

      // 2. Use the new `queryWithAudit` function
      const result = await queryWithAudit(queryText, params, userId);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}