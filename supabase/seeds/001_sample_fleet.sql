-- FleetOps — reproducible seed data (Bengaluru-region operations).
-- Safe to re-run: clears operational rows first. Does not touch auth users or profiles.
begin;

delete from public.vehicle_events;
delete from public.vehicle_locations;
delete from public.trips;
delete from public.vehicles;
delete from public.drivers;

-- ---------------------------------------------------------------------------
-- Drivers
-- ---------------------------------------------------------------------------
insert into public.drivers (id, full_name, phone, license_number, status, created_at) values
('b0000000-0000-4000-8000-000000000001', 'Arjun Mehta',       '+91 98450 11201', 'KA-01-20180012341', 'active',   now() - interval '520 days'),
('b0000000-0000-4000-8000-000000000002', 'Priya Nair',        '+91 98450 11202', 'KA-01-20180012342', 'active',   now() - interval '510 days'),
('b0000000-0000-4000-8000-000000000003', 'Rahul Verma',       '+91 98450 11203', 'KA-01-20190012343', 'active',   now() - interval '490 days'),
('b0000000-0000-4000-8000-000000000004', 'Sneha Iyer',        '+91 98450 11204', 'KA-01-20190012344', 'active',   now() - interval '470 days'),
('b0000000-0000-4000-8000-000000000005', 'Vikram Rao',        '+91 98450 11205', 'KA-01-20200012345', 'active',   now() - interval '455 days'),
('b0000000-0000-4000-8000-000000000006', 'Ananya Shetty',     '+91 98450 11206', 'KA-01-20200012346', 'active',   now() - interval '430 days'),
('b0000000-0000-4000-8000-000000000007', 'Kiran Kumar',       '+91 98450 11207', 'KA-01-20210012347', 'active',   now() - interval '410 days'),
('b0000000-0000-4000-8000-000000000008', 'Meera Joshi',       '+91 98450 11208', 'KA-01-20210012348', 'active',   now() - interval '385 days'),
('b0000000-0000-4000-8000-000000000009', 'Dev Patel',         '+91 98450 11209', 'KA-01-20220012349', 'active',   now() - interval '360 days'),
('b0000000-0000-4000-8000-00000000000a', 'Fatima Khan',       '+91 98450 11210', 'KA-01-20220012350', 'active',   now() - interval '340 days'),
('b0000000-0000-4000-8000-00000000000b', 'Nikhil Reddy',      '+91 98450 11211', 'KA-01-20230012351', 'on_leave', now() - interval '300 days'),
('b0000000-0000-4000-8000-00000000000c', 'Deepa Gowda',       '+91 98450 11212', 'KA-01-20230012352', 'active',   now() - interval '280 days');

-- ---------------------------------------------------------------------------
-- Vehicles — last_seen_at and ignition are consistent with the seeded status.
-- ---------------------------------------------------------------------------
insert into public.vehicles
  (id, registration_number, vehicle_name, vehicle_type, manufacturer, model,
   driver_id, status, fuel_level, battery_level, ignition_state, last_seen_at)
values
('a0000000-0000-4000-8000-000000000001', 'KA-01-MJ-4821', 'Van 01 · Indiranagar',   'Delivery Van',  'Tata Motors',   'Ace',        'b0000000-0000-4000-8000-000000000001', 'moving',    68, 82, true,  now() - interval '2 minutes'),
('a0000000-0000-4000-8000-000000000002', 'KA-02-CB-7714', 'Van 02 · Whitefield',    'Delivery Van',  'Maruti Suzuki', 'Eeco',       'b0000000-0000-4000-8000-000000000002', 'moving',    42, 76, true,  now() - interval '4 minutes'),
('a0000000-0000-4000-8000-000000000003', 'KA-03-MN-2290', 'Truck 03 · Hebbal',      'Cargo Truck',   'Ashok Leyland', 'Dost',       'b0000000-0000-4000-8000-000000000003', 'idle',      77, 71, true,  now() - interval '13 minutes'),
('a0000000-0000-4000-8000-000000000004', 'KA-05-HR-9012', 'Van 04 · Hosur',         'Passenger Van', 'Toyota',        'Innova',     'b0000000-0000-4000-8000-000000000004', 'offline',   31, 64, false, now() - interval '9 hours'),
('a0000000-0000-4000-8000-000000000005', 'KA-01-SV-3388', 'Van 05 · Electronic City','Delivery Van', 'Tata Motors',   'Ace',        'b0000000-0000-4000-8000-000000000005', 'attention', 12, 58, true,  now() - interval '38 minutes'),
('a0000000-0000-4000-8000-000000000006', 'KA-02-AB-6640', 'Pickup 06 · Kormangala', 'Pickup',        'Mahindra',      'Bolero',     'b0000000-0000-4000-8000-000000000006', 'moving',    55, 88, true,  now() - interval '1 minute'),
('a0000000-0000-4000-8000-000000000007', 'KA-03-TX-1207', 'Truck 07 · Airport',     'Box Truck',     'Eicher',        'Pro 2049',   'b0000000-0000-4000-8000-000000000007', 'idle',      64, 69, true,  now() - interval '21 minutes'),
('a0000000-0000-4000-8000-000000000008', 'KA-04-YZ-5531', 'Van 08 · Rajajinagar',   'Passenger Van', 'Maruti Suzuki', 'Ertiga',     'b0000000-0000-4000-8000-000000000008', 'offline',   28, 53, false, now() - interval '14 hours'),
('a0000000-0000-4000-8000-000000000009', 'KA-01-LP-8803', 'Van 09 · Silk Board',    'Delivery Van',  'Tata Motors',   'Ace',        'b0000000-0000-4000-8000-000000000009', 'moving',    81, 91, true,  now() - interval '3 minutes'),
('a0000000-0000-4000-8000-00000000000a', 'KA-05-GH-4419', 'EV 10 · HSR Layout',     'Electric Van',  'Mahindra',      'Treo',       'b0000000-0000-4000-8000-00000000000a', 'attention', 19, 47, true,  now() - interval '44 minutes'),
('a0000000-0000-4000-8000-00000000000b', 'KA-02-JK-7745', 'EV 11 · Jayanagar',      'Electric Van',  'Tata Motors',   'Ace EV',     'b0000000-0000-4000-8000-00000000000b', 'idle',      73, 62, true,  now() - interval '17 minutes'),
('a0000000-0000-4000-8000-00000000000c', 'KA-03-RT-9926', 'Truck 12 · Yeshwanthpur','Cargo Truck',   'Ashok Leyland', 'Dost',       'b0000000-0000-4000-8000-00000000000c', 'moving',    47, 79, true,  now() - interval '6 minutes'),
('a0000000-0000-4000-8000-00000000000d', 'KA-04-DE-3358', 'Van 13 · Bannerghatta',  'Delivery Van',  'Maruti Suzuki', 'Eeco',       'b0000000-0000-4000-8000-000000000003', 'offline',   36, 44, false, now() - interval '6 hours'),
('a0000000-0000-4000-8000-00000000000e', 'KA-01-WQ-6612', 'Pickup 14 · Yelahanka',  'Pickup',        'Mahindra',      'Bolero',     'b0000000-0000-4000-8000-000000000007', 'idle',      59, 74, true,  now() - interval '25 minutes'),
('a0000000-0000-4000-8000-00000000000f', 'KA-05-NC-1184', 'EV 15 · Marathahalli',   'Electric Van',  'Mahindra',      'Treo',       'b0000000-0000-4000-8000-000000000009', 'attention', 24, 14, true,  now() - interval '51 minutes'),
('a0000000-0000-4000-8000-000000000010', 'KA-02-FD-9077', 'Van 16 · Mysuru Road',   'Passenger Van', 'Toyota',        'Innova',     'b0000000-0000-4000-8000-000000000004', 'offline',   66, 57, false, now() - interval '11 hours');

-- ---------------------------------------------------------------------------
-- Routes and 32 historical trips spread over the last ~19 days.
-- Each route has realistic Bengaluru start/end coordinates; location points
-- are interpolated between them below.
-- ---------------------------------------------------------------------------
with routes(idx, start_location, end_location, slat, slon, elat, elon, km) as (
  values
    (1,  'Indiranagar',       'Electronic City',     12.9719, 77.6412, 12.8452, 77.6602, 22),
    (2,  'Whitefield',        'MG Road',             12.9698, 77.7499, 12.9758, 77.6050, 18),
    (3,  'Koramangala',       'Marathahalli',        12.9352, 77.6245, 12.9569, 77.7011, 14),
    (4,  'Jayanagar',         'Hebbal',              12.9279, 77.6271, 13.0358, 77.5970, 19),
    (5,  'Electronic City',   'Hosur',               12.8452, 77.6602, 12.7409, 77.8253, 25),
    (6,  'MG Road',           'Mysuru Road',         12.9758, 77.6050, 12.9800, 77.5360, 10),
    (7,  'Yelahanka',         'Kempegowda Airport',  13.1006, 77.5968, 13.1986, 77.7066, 16),
    (8,  'Banashankari',      'Silk Board',          12.9250, 77.5460, 12.9177, 77.6220, 12),
    (9,  'HSR Layout',        'Cubbon Park',         12.9116, 77.6412, 12.9765, 77.5920, 17),
    (10, 'Bannerghatta Road', 'Rajajinagar',         12.8850, 77.5980, 12.9900, 77.5500, 21),
    (11, 'Kalyan Nagar',      'Electronic City',     13.0350, 77.6400, 12.8452, 77.6602, 24),
    (12, 'Yeshwanthpur',      'Whitefield',          13.0280, 77.5540, 12.9698, 77.7499, 27)
),
trip_seed as (
  select
    n::int as n,
    ('c0000000-0000-4000-8000-' || lpad(to_hex(n), 12, '0'))::uuid as id,
    ('a0000000-0000-4000-8000-' || lpad(to_hex(((n - 1) % 16) + 1), 12, '0'))::uuid as vehicle_id,
    v.driver_id,
    r.start_location, r.end_location, r.slat, r.slon, r.elat, r.elon,
    now() - ((n * 14 + 3) || ' hours')::interval as started_at,
    (35 + ((n * 7) % 95))::int as duration_minutes,
    (r.km + (((n % 5) - 2) * 0.8))::numeric(8, 2) as distance_km,
    case when n in (2, 9, 21) then 'in_progress'::public.trip_status
         when n = 30 then 'cancelled'::public.trip_status
         else 'completed'::public.trip_status end as status,
    (2 + (n % 9))::int as idle_minutes,
    (1 + (n % 4))::int as halt_count,
    case when n % 5 = 0 then (2 + (n % 3)) else 0 end::int as overspeed_events
  from generate_series(1, 32) as n
  join routes r on r.idx = ((n - 1) % 12) + 1
  join public.vehicles v on v.id = ('a0000000-0000-4000-8000-' || lpad(to_hex(((n - 1) % 16) + 1), 12, '0'))::uuid
)
insert into public.trips
  (id, vehicle_id, driver_id, start_location, end_location,
   start_latitude, start_longitude, end_latitude, end_longitude,
   started_at, ended_at, distance_km, duration_minutes, average_speed,
   maximum_speed, idle_minutes, halt_count, overspeed_events, status)
select
  id, vehicle_id, driver_id, start_location, end_location,
  slat, slon, elat, elon,
  started_at,
  case when status = 'in_progress' then null
       else started_at + (duration_minutes || ' minutes')::interval end,
  distance_km, duration_minutes,
  round(distance_km / duration_minutes * 60, 1),
  round(distance_km / duration_minutes * 60 * 1.45 + (n % 7), 1),
  idle_minutes, halt_count, overspeed_events, status
from trip_seed;

-- ---------------------------------------------------------------------------
-- Historical location points: 14 per trip, interpolated along the route.
-- ---------------------------------------------------------------------------
insert into public.vehicle_locations
  (vehicle_id, trip_id, latitude, longitude, speed, recorded_at, ignition_state)
select
  t.vehicle_id,
  t.id,
  t.start_latitude + (t.end_latitude - t.start_latitude) * (g::double precision / 13)
    + (((g * 7) % 5 - 2) * 0.004 * sin(pi() * g::double precision / 13)),
  t.start_longitude + (t.end_longitude - t.start_longitude) * (g::double precision / 13)
    + (((g * 11) % 5 - 2) * 0.004 * sin(pi() * g::double precision / 13)),
  case when g in (0, 13) then 0
       else (22 + ((g * 13 + t.duration_minutes) % 42))::numeric end,
  t.started_at + (t.duration_minutes::double precision * (g::double precision / 13)) * interval '1 minute',
  g < 13 or t.status = 'in_progress'
from public.trips t
cross join generate_series(0, 13) as g;

-- ---------------------------------------------------------------------------
-- Most recent location per vehicle: anchored to each vehicle's last_seen_at
-- so markers, status and "last seen" agree. These are the points the map uses.
-- ---------------------------------------------------------------------------
with numbered as (
  select v.*, row_number() over (order by v.id)::int as rn from public.vehicles v
),
last_trip as (
  select distinct on (vehicle_id) vehicle_id, id as trip_id, end_latitude, end_longitude
  from public.trips order by vehicle_id, started_at desc
)
insert into public.vehicle_locations
  (vehicle_id, trip_id, latitude, longitude, speed, recorded_at, ignition_state)
select
  n.id,
  lt.trip_id,
  lt.end_latitude + (((n.rn % 5) - 2) * 0.0035),
  lt.end_longitude + (((n.rn % 7) - 3) * 0.0035),
  case n.status when 'moving' then (38 + n.rn % 12)::numeric
                when 'attention' then (64 + n.rn % 9)::numeric
                else 0 end,
  n.last_seen_at,
  n.status <> 'offline'
from numbered n
join last_trip lt on lt.vehicle_id = n.id;

-- ---------------------------------------------------------------------------
-- Events: trip lifecycle for the 16 newest trips + abnormal operational cases.
-- ---------------------------------------------------------------------------
with recent as (
  select * from public.trips order by started_at desc limit 16
)
insert into public.vehicle_events
  (vehicle_id, trip_id, event_type, severity, description, occurred_at, acknowledged)
select vehicle_id, id, 'trip_started'::public.event_type, 'info'::public.event_severity,
       'Trip started from ' || start_location, started_at, false
from recent
union all
select vehicle_id, id, 'trip_completed'::public.event_type, 'info'::public.event_severity,
       'Trip completed at ' || end_location, ended_at, false
from recent
where status = 'completed' and ended_at is not null;

insert into public.vehicle_events
  (vehicle_id, trip_id, event_type, severity, description, occurred_at, acknowledged)
values
('a0000000-0000-4000-8000-000000000005', null, 'overspeed_detected', 'critical', '92 km/h in a 60 km/h zone near Electronic City', now() - interval '38 minutes', false),
('a0000000-0000-4000-8000-00000000000a', null, 'overspeed_detected', 'warning',  '78 km/h sustained for 4 minutes on Hosur Road', now() - interval '44 minutes', false),
('a0000000-0000-4000-8000-00000000000f', null, 'low_battery',       'critical', 'Battery at 14% — below the 20% operational threshold', now() - interval '51 minutes', false),
('a0000000-0000-4000-8000-000000000005', null, 'low_fuel',          'warning',  'Fuel at 12% — refuel before next assignment', now() - interval '1 hour', false),
('a0000000-0000-4000-8000-00000000000a', null, 'low_fuel',          'warning',  'Fuel at 19% — refuel before next assignment', now() - interval '2 hours', false),
('a0000000-0000-4000-8000-000000000009', null, 'overspeed_detected', 'warning', '74 km/h on Outer Ring Road, above fleet policy', now() - interval '3 hours', false),
('a0000000-0000-4000-8000-000000000004', null, 'went_offline',      'warning',  'No location received for over 8 hours near Hosur', now() - interval '9 hours', false),
('a0000000-0000-4000-8000-000000000008', null, 'went_offline',      'warning',  'No location received for over 12 hours near Rajajinagar', now() - interval '14 hours', false),
('a0000000-0000-4000-8000-00000000000d', null, 'went_offline',      'info',     'Device went offline near Bannerghatta Road', now() - interval '6 hours', false),
('a0000000-0000-4000-8000-000000000010', null, 'went_offline',      'info',     'Device went offline overnight near Mysuru Road', now() - interval '11 hours', true),
('a0000000-0000-4000-8000-000000000003', null, 'long_idle',         'warning',  'Idled for 47 minutes at Hebbal depot', now() - interval '13 minutes', false),
('a0000000-0000-4000-8000-000000000007', null, 'long_idle',         'info',     'Idled for 32 minutes near airport cargo gate', now() - interval '21 minutes', false),
('a0000000-0000-4000-8000-00000000000b', null, 'long_idle',         'info',     'Idled for 28 minutes in Jayanagar', now() - interval '17 minutes', false),
('a0000000-0000-4000-8000-00000000000e', null, 'long_idle',         'warning',  'Idled for 41 minutes at Yelahanka', now() - interval '25 minutes', false),
('a0000000-0000-4000-8000-000000000004', null, 'ignition_off',      'info',     'Ignition turned off near Hosur', now() - interval '9 hours', true),
('a0000000-0000-4000-8000-000000000008', null, 'ignition_off',      'info',     'Ignition turned off near Rajajinagar', now() - interval '14 hours', true),
('a0000000-0000-4000-8000-000000000001', null, 'vehicle_resumed',   'info',     'Vehicle resumed movement from Indiranagar', now() - interval '2 minutes', false),
('a0000000-0000-4000-8000-000000000006', null, 'vehicle_resumed',   'info',     'Vehicle resumed movement from Koramangala', now() - interval '1 minute', false),
('a0000000-0000-4000-8000-000000000002', null, 'ignition_on',       'info',     'Ignition turned on at Whitefield hub', now() - interval '5 hours', true);

commit;
