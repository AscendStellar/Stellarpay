import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const passwordHash = await bcrypt.hash('password123', 12)

  const merchant = await prisma.merchant.upsert({
    where: { email: 'demo@stellarpay.dev' },
    update: {},
    create: {
      email: 'demo@stellarpay.dev',
      name: 'Demo User',
      businessName: 'Demo Store',
      passwordHash,
      stellarPublicKey: 'GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBWE3IKMB5OK7',
    },
  })

  console.log('✅ Created demo merchant:', merchant.email)
  console.log('   Login: demo@stellarpay.dev / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
