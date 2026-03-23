import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@flordelotus.pt';
  const adminPassword = '123456';

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.admin.create({
      data: {
        name: 'Admin Flor de Lótus',
        email: adminEmail,
        password: hashedPassword,
      },
    });
  }

  const services = [
    {
      name: 'Manicure com Verniz e Gel',
      description: 'Serviço profissional de manicure com verniz e gel.',
      price: 25,
      priceText: '25 €',
      durationMinutes: 60,
      active: true,
      requiresImage: false,
    },
    {
      name: 'Pedicure com Verniz e Gel',
      description: 'Serviço profissional de pedicure com verniz e gel.',
      price: 30,
      priceText: '30 €',
      durationMinutes: 60,
      active: true,
      requiresImage: false,
    },
    {
      name: 'Podologia',
      description: 'Atendimento de podologia com valor definido por avaliação.',
      price: null,
      priceText: 'Por avaliação',
      durationMinutes: 60,
      active: true,
      requiresImage: true,
    },
  ];

  for (const service of services) {
    const existingService = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!existingService) {
      await prisma.service.create({
        data: service,
      });
    }
  }

  const existingSettings = await prisma.businessSetting.findFirst();

  if (!existingSettings) {
    await prisma.businessSetting.create({
      data: {
        businessName: 'Flor de Lótus Podologia',
        phone: '+351 000 000 000',
        notificationEmail: 'admin@flordelotus.pt',
        address: 'Albufeira',
        city: 'Albufeira',
        country: 'Portugal',
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        workingDays: '1,2,3,4,5',
        defaultDurationMinutes: 60,
      },
    });
  }

  console.log('Seed executado com sucesso.');
  console.log('Admin inicial:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Senha: ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });